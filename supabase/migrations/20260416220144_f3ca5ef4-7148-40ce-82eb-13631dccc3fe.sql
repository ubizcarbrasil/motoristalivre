-- ─────────────────────────────────────────────────────────────
-- Função que processa comissões de uma corrida concluída
-- Tudo em uma única transação (a própria função SQL é atômica)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.process_ride_commission(_ride_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ride record;
  _settings record;
  _driver_wallet record;
  _origin_wallet record;
  _affiliate_wallet record;
  _passenger record;
  _comissao_transbordo numeric := 0;
  _comissao_afiliado numeric := 0;
  _cashback numeric := 0;
  _new_balance numeric;
  _result jsonb := '{}'::jsonb;
BEGIN
  -- (1) Idempotência: já processado?
  IF EXISTS (
    SELECT 1 FROM public.commissions
    WHERE ride_id = _ride_id AND status = 'processed'
  ) THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'already_processed');
  END IF;

  -- (2) Carrega corrida
  SELECT * INTO _ride FROM public.rides WHERE id = _ride_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride not found: %', _ride_id;
  END IF;

  IF _ride.completed_at IS NULL OR _ride.price_paid IS NULL OR _ride.price_paid <= 0 THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'not_completed_or_no_price');
  END IF;

  -- (3) Settings do tenant
  SELECT * INTO _settings FROM public.tenant_settings WHERE tenant_id = _ride.tenant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant settings not found for tenant %', _ride.tenant_id;
  END IF;

  -- (4a) Comissão de transbordo
  IF _ride.is_transbordo = true
     AND _ride.origin_driver_id IS NOT NULL
     AND _ride.origin_driver_id <> _ride.driver_id
     AND _settings.transbordo_commission > 0
  THEN
    _comissao_transbordo := round((_ride.price_paid * _settings.transbordo_commission / 100)::numeric, 2);

    SELECT * INTO _driver_wallet FROM public.wallets
      WHERE owner_id = _ride.driver_id AND owner_type = 'driver' FOR UPDATE;
    SELECT * INTO _origin_wallet FROM public.wallets
      WHERE owner_id = _ride.origin_driver_id AND owner_type = 'driver' FOR UPDATE;

    IF _driver_wallet.id IS NOT NULL AND _origin_wallet.id IS NOT NULL AND _comissao_transbordo > 0 THEN
      -- Debita motorista atendente
      _new_balance := _driver_wallet.balance - _comissao_transbordo;
      UPDATE public.wallets SET balance = _new_balance, updated_at = now() WHERE id = _driver_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _driver_wallet.id, _ride.tenant_id, 'commission_transbordo',
        -_comissao_transbordo, _new_balance,
        'Comissão transbordo - corrida ' || substr(_ride_id::text, 1, 8), _ride_id
      );

      -- Credita motorista dono
      _new_balance := _origin_wallet.balance + _comissao_transbordo;
      UPDATE public.wallets
        SET balance = _new_balance, total_earned = total_earned + _comissao_transbordo, updated_at = now()
        WHERE id = _origin_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _origin_wallet.id, _ride.tenant_id, 'commission_transbordo',
        _comissao_transbordo, _new_balance,
        'Receita transbordo - corrida ' || substr(_ride_id::text, 1, 8), _ride_id
      );

      INSERT INTO public.commissions (
        ride_id, tenant_id, commission_type, amount,
        from_wallet_id, to_wallet_id, status, processed_at
      ) VALUES (
        _ride_id, _ride.tenant_id, 'transbordo', _comissao_transbordo,
        _driver_wallet.id, _origin_wallet.id, 'processed', now()
      );
    END IF;
  END IF;

  -- (4b) Comissão de afiliado
  IF _ride.origin_affiliate_id IS NOT NULL AND _settings.affiliate_commission > 0 THEN
    _comissao_afiliado := round((_ride.price_paid * _settings.affiliate_commission / 100)::numeric, 2);

    SELECT * INTO _affiliate_wallet FROM public.wallets
      WHERE owner_id = _ride.origin_affiliate_id AND owner_type = 'affiliate' FOR UPDATE;

    IF _driver_wallet.id IS NULL THEN
      SELECT * INTO _driver_wallet FROM public.wallets
        WHERE owner_id = _ride.driver_id AND owner_type = 'driver' FOR UPDATE;
    END IF;

    IF _affiliate_wallet.id IS NOT NULL AND _driver_wallet.id IS NOT NULL AND _comissao_afiliado > 0 THEN
      _new_balance := _driver_wallet.balance - _comissao_afiliado;
      UPDATE public.wallets SET balance = _new_balance, updated_at = now() WHERE id = _driver_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _driver_wallet.id, _ride.tenant_id, 'commission_affiliate',
        -_comissao_afiliado, _new_balance,
        'Comissão afiliado - corrida ' || substr(_ride_id::text, 1, 8), _ride_id
      );

      _new_balance := _affiliate_wallet.balance + _comissao_afiliado;
      UPDATE public.wallets
        SET balance = _new_balance, total_earned = total_earned + _comissao_afiliado, updated_at = now()
        WHERE id = _affiliate_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _affiliate_wallet.id, _ride.tenant_id, 'commission_affiliate',
        _comissao_afiliado, _new_balance,
        'Comissão afiliado - corrida ' || substr(_ride_id::text, 1, 8), _ride_id
      );

      INSERT INTO public.commissions (
        ride_id, tenant_id, commission_type, amount,
        from_wallet_id, to_wallet_id, status, processed_at
      ) VALUES (
        _ride_id, _ride.tenant_id, 'affiliate', _comissao_afiliado,
        _driver_wallet.id, _affiliate_wallet.id, 'processed', now()
      );
    END IF;
  END IF;

  -- (4c) Cashback do passageiro
  IF _settings.cashback_pct > 0 THEN
    _cashback := round((_ride.price_paid * _settings.cashback_pct / 100)::numeric, 2);

    IF _cashback > 0 THEN
      SELECT * INTO _passenger FROM public.passengers WHERE id = _ride.passenger_id FOR UPDATE;

      IF FOUND THEN
        _new_balance := _passenger.cashback_balance + _cashback;
        UPDATE public.passengers
          SET cashback_balance = _new_balance, updated_at = now()
          WHERE id = _passenger.id;

        INSERT INTO public.cashback_transactions (
          passenger_id, tenant_id, type, amount, balance_after, ride_id
        ) VALUES (
          _passenger.id, _ride.tenant_id, 'credit', _cashback, _new_balance, _ride_id
        );

        UPDATE public.rides SET cashback_amount = _cashback WHERE id = _ride_id;
      END IF;
    END IF;
  END IF;

  -- (5) Audit log
  INSERT INTO public.audit_logs (
    action, entity_type, entity_id, tenant_id, user_id, payload
  ) VALUES (
    'commission_processed', 'ride', _ride_id, _ride.tenant_id, _ride.driver_id,
    jsonb_build_object(
      'price_paid', _ride.price_paid,
      'transbordo', _comissao_transbordo,
      'affiliate', _comissao_afiliado,
      'cashback', _cashback,
      'is_transbordo', _ride.is_transbordo
    )
  );

  _result := jsonb_build_object(
    'processed', true,
    'transbordo_commission', _comissao_transbordo,
    'affiliate_commission', _comissao_afiliado,
    'cashback', _cashback
  );
  RETURN _result;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Trigger: chama process_ride_commission quando ride é completada
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_process_ride_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Dispara apenas quando completed_at acabou de ser setado
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    PERFORM public.process_ride_commission(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rides_process_commission ON public.rides;
CREATE TRIGGER rides_process_commission
  AFTER UPDATE OF completed_at ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_process_ride_commission();