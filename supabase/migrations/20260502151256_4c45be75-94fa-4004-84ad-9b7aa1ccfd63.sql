CREATE OR REPLACE FUNCTION public.process_service_commission(_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _booking record;
  _service record;
  _settings record;
  _rule record;
  _category_id uuid;
  _attendant_wallet record;
  _origin_wallet record;
  _referral_wallet record;
  _comissao_cobertura numeric := 0;
  _comissao_indicacao numeric := 0;
  _pct_cobertura numeric := 0;
  _pct_indicacao numeric := 0;
  _new_balance numeric;
BEGIN
  -- (1) Idempotência
  IF EXISTS (
    SELECT 1 FROM public.commissions
    WHERE ride_id = _booking_id AND status = 'processed'
      AND commission_context = 'servico'
  ) THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'already_processed');
  END IF;

  -- (2) Carrega booking
  SELECT * INTO _booking FROM public.service_bookings WHERE id = _booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service booking not found: %', _booking_id;
  END IF;

  IF _booking.status <> 'completed' OR _booking.price_agreed IS NULL OR _booking.price_agreed <= 0 THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'not_completed_or_no_price');
  END IF;

  -- (3) Carrega tipo de serviço para descobrir a categoria
  SELECT * INTO _service FROM public.service_types WHERE id = _booking.service_type_id;
  _category_id := _service.category_id;

  -- (4) Settings do tenant (fallback)
  SELECT * INTO _settings FROM public.tenant_settings WHERE tenant_id = _booking.tenant_id;

  -- (5) Regra por categoria
  IF _category_id IS NOT NULL THEN
    SELECT * INTO _rule
    FROM public.commission_rules
    WHERE tenant_id = _booking.tenant_id
      AND category_id = _category_id
      AND ativo = true
    LIMIT 1;
  END IF;

  IF FOUND AND _rule.id IS NOT NULL THEN
    _pct_cobertura := COALESCE(_rule.comissao_cobertura_pct, 0);
    _pct_indicacao := COALESCE(_rule.comissao_indicacao_pct, 0);
  ELSE
    _pct_cobertura := COALESCE(_settings.transbordo_commission, 0);
    _pct_indicacao := COALESCE(_settings.affiliate_commission, 0);
  END IF;

  -- (6a) COBERTURA: serviço originado por outro profissional
  IF _booking.is_coverage = true
     AND _booking.origin_driver_id IS NOT NULL
     AND _booking.origin_driver_id <> _booking.driver_id
     AND _pct_cobertura > 0
  THEN
    IF _rule.id IS NOT NULL AND COALESCE(_rule.comissao_fixa_brl, 0) > 0 THEN
      _comissao_cobertura := _rule.comissao_fixa_brl;
    ELSE
      _comissao_cobertura := round((_booking.price_agreed * _pct_cobertura / 100)::numeric, 2);
    END IF;

    SELECT * INTO _attendant_wallet FROM public.wallets
      WHERE owner_id = _booking.driver_id AND owner_type = 'driver' FOR UPDATE;
    SELECT * INTO _origin_wallet FROM public.wallets
      WHERE owner_id = _booking.origin_driver_id AND owner_type = 'driver' FOR UPDATE;

    IF _attendant_wallet.id IS NOT NULL AND _origin_wallet.id IS NOT NULL AND _comissao_cobertura > 0 THEN
      _new_balance := _attendant_wallet.balance - _comissao_cobertura;
      UPDATE public.wallets SET balance = _new_balance, updated_at = now() WHERE id = _attendant_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _attendant_wallet.id, _booking.tenant_id, 'commission_service_coverage',
        -_comissao_cobertura, _new_balance,
        'Comissão cobertura serviço - ' || substr(_booking_id::text, 1, 8), _booking_id
      );

      _new_balance := _origin_wallet.balance + _comissao_cobertura;
      UPDATE public.wallets
        SET balance = _new_balance, total_earned = total_earned + _comissao_cobertura, updated_at = now()
        WHERE id = _origin_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _origin_wallet.id, _booking.tenant_id, 'commission_service_coverage',
        _comissao_cobertura, _new_balance,
        'Receita cobertura serviço - ' || substr(_booking_id::text, 1, 8), _booking_id
      );

      INSERT INTO public.commissions (
        ride_id, tenant_id, commission_type, amount,
        from_wallet_id, to_wallet_id, status, processed_at, commission_context
      ) VALUES (
        _booking_id, _booking.tenant_id, 'service_coverage', _comissao_cobertura,
        _attendant_wallet.id, _origin_wallet.id, 'processed', now(), 'servico'
      );
    END IF;
  END IF;

  -- (6b) INDICAÇÃO: outro profissional indicou o cliente
  IF _booking.origin_driver_id IS NOT NULL
     AND _booking.is_coverage = false
     AND _booking.origin_driver_id <> _booking.driver_id
     AND _pct_indicacao > 0
  THEN
    _comissao_indicacao := round((_booking.price_agreed * _pct_indicacao / 100)::numeric, 2);

    IF _attendant_wallet.id IS NULL THEN
      SELECT * INTO _attendant_wallet FROM public.wallets
        WHERE owner_id = _booking.driver_id AND owner_type = 'driver' FOR UPDATE;
    END IF;
    SELECT * INTO _referral_wallet FROM public.wallets
      WHERE owner_id = _booking.origin_driver_id AND owner_type = 'driver' FOR UPDATE;

    IF _attendant_wallet.id IS NOT NULL AND _referral_wallet.id IS NOT NULL AND _comissao_indicacao > 0 THEN
      _new_balance := _attendant_wallet.balance - _comissao_indicacao;
      UPDATE public.wallets SET balance = _new_balance, updated_at = now() WHERE id = _attendant_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _attendant_wallet.id, _booking.tenant_id, 'commission_service_referral',
        -_comissao_indicacao, _new_balance,
        'Comissão indicação serviço - ' || substr(_booking_id::text, 1, 8), _booking_id
      );

      _new_balance := _referral_wallet.balance + _comissao_indicacao;
      UPDATE public.wallets
        SET balance = _new_balance, total_earned = total_earned + _comissao_indicacao, updated_at = now()
        WHERE id = _referral_wallet.id;
      INSERT INTO public.wallet_transactions (
        wallet_id, tenant_id, type, amount, balance_after, description, reference_id
      ) VALUES (
        _referral_wallet.id, _booking.tenant_id, 'commission_service_referral',
        _comissao_indicacao, _new_balance,
        'Receita indicação serviço - ' || substr(_booking_id::text, 1, 8), _booking_id
      );

      INSERT INTO public.commissions (
        ride_id, tenant_id, commission_type, amount,
        from_wallet_id, to_wallet_id, status, processed_at, commission_context
      ) VALUES (
        _booking_id, _booking.tenant_id, 'service_referral', _comissao_indicacao,
        _attendant_wallet.id, _referral_wallet.id, 'processed', now(), 'servico'
      );
    END IF;
  END IF;

  -- (7) Audit log
  INSERT INTO public.audit_logs (
    action, entity_type, entity_id, tenant_id, user_id, payload
  ) VALUES (
    'service_commission_processed', 'service_booking', _booking_id, _booking.tenant_id, _booking.driver_id,
    jsonb_build_object(
      'price_agreed', _booking.price_agreed,
      'category_id', _category_id,
      'is_coverage', _booking.is_coverage,
      'cobertura', _comissao_cobertura,
      'indicacao', _comissao_indicacao,
      'rule_used', (_rule.id IS NOT NULL)
    )
  );

  RETURN jsonb_build_object(
    'processed', true,
    'service_coverage', _comissao_cobertura,
    'service_referral', _comissao_indicacao
  );
END;
$function$;

-- Trigger: dispara quando status muda para 'completed'
CREATE OR REPLACE FUNCTION public.trg_process_service_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    PERFORM public.process_service_commission(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_process_service_commission ON public.service_bookings;
CREATE TRIGGER trg_process_service_commission
AFTER UPDATE ON public.service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.trg_process_service_commission();