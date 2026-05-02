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
  _attendant_wallet_id uuid;
  _attendant_balance numeric;
  _origin_wallet_id uuid;
  _origin_balance numeric;
  _origin_total_earned numeric;
  _referral_wallet_id uuid;
  _referral_balance numeric;
  _referral_total_earned numeric;
  _comissao_cobertura numeric := 0;
  _comissao_indicacao numeric := 0;
  _pct_cobertura numeric := 0;
  _pct_indicacao numeric := 0;
  _new_balance numeric;
  _has_rule boolean := false;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.commissions
    WHERE booking_id = _booking_id AND status = 'processed' AND commission_context = 'servico'
  ) THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'already_processed');
  END IF;

  SELECT * INTO _booking FROM public.service_bookings WHERE id = _booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service booking not found: %', _booking_id;
  END IF;

  IF _booking.status <> 'completed' OR _booking.price_agreed IS NULL OR _booking.price_agreed <= 0 THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'not_completed_or_no_price');
  END IF;

  SELECT * INTO _service FROM public.service_types WHERE id = _booking.service_type_id;
  _category_id := _service.category_id;

  SELECT * INTO _settings FROM public.tenant_settings WHERE tenant_id = _booking.tenant_id;

  IF _category_id IS NOT NULL THEN
    SELECT id, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl
      INTO _rule
    FROM public.commission_rules
    WHERE tenant_id = _booking.tenant_id AND category_id = _category_id AND ativo = true
    LIMIT 1;
    IF FOUND THEN _has_rule := true; END IF;
  END IF;

  IF _has_rule THEN
    _pct_cobertura := COALESCE(_rule.comissao_cobertura_pct, 0);
    _pct_indicacao := COALESCE(_rule.comissao_indicacao_pct, 0);
  ELSE
    _pct_cobertura := COALESCE(_settings.transbordo_commission, 0);
    _pct_indicacao := COALESCE(_settings.affiliate_commission, 0);
  END IF;

  -- COBERTURA
  IF _booking.is_coverage = true
     AND _booking.origin_driver_id IS NOT NULL
     AND _booking.origin_driver_id <> _booking.driver_id
     AND _pct_cobertura > 0
  THEN
    IF _has_rule AND COALESCE(_rule.comissao_fixa_brl, 0) > 0 THEN
      _comissao_cobertura := _rule.comissao_fixa_brl;
    ELSE
      _comissao_cobertura := round((_booking.price_agreed * _pct_cobertura / 100)::numeric, 2);
    END IF;

    SELECT id, balance INTO _attendant_wallet_id, _attendant_balance
    FROM public.wallets
    WHERE owner_id = _booking.driver_id AND owner_type = 'driver' FOR UPDATE;

    SELECT id, balance, total_earned INTO _origin_wallet_id, _origin_balance, _origin_total_earned
    FROM public.wallets
    WHERE owner_id = _booking.origin_driver_id AND owner_type = 'driver' FOR UPDATE;

    IF _attendant_wallet_id IS NOT NULL AND _origin_wallet_id IS NOT NULL AND _comissao_cobertura > 0 THEN
      _new_balance := _attendant_balance - _comissao_cobertura;
      UPDATE public.wallets SET balance = _new_balance, updated_at = now() WHERE id = _attendant_wallet_id;
      _attendant_balance := _new_balance;
      INSERT INTO public.wallet_transactions (wallet_id, tenant_id, type, amount, balance_after, description, reference_id)
      VALUES (_attendant_wallet_id, _booking.tenant_id, 'commission_service_coverage',
              -_comissao_cobertura, _new_balance,
              'Comissão cobertura serviço - ' || substr(_booking_id::text, 1, 8), _booking_id);

      _new_balance := _origin_balance + _comissao_cobertura;
      UPDATE public.wallets
        SET balance = _new_balance, total_earned = _origin_total_earned + _comissao_cobertura, updated_at = now()
        WHERE id = _origin_wallet_id;
      INSERT INTO public.wallet_transactions (wallet_id, tenant_id, type, amount, balance_after, description, reference_id)
      VALUES (_origin_wallet_id, _booking.tenant_id, 'commission_service_coverage',
              _comissao_cobertura, _new_balance,
              'Receita cobertura serviço - ' || substr(_booking_id::text, 1, 8), _booking_id);

      INSERT INTO public.commissions (booking_id, tenant_id, commission_type, amount, from_wallet_id, to_wallet_id, status, processed_at, commission_context)
      VALUES (_booking_id, _booking.tenant_id, 'service_coverage', _comissao_cobertura,
              _attendant_wallet_id, _origin_wallet_id, 'processed', now(), 'servico');
    END IF;
  END IF;

  -- INDICAÇÃO
  IF _booking.origin_driver_id IS NOT NULL
     AND _booking.is_coverage = false
     AND _booking.origin_driver_id <> _booking.driver_id
     AND _pct_indicacao > 0
  THEN
    _comissao_indicacao := round((_booking.price_agreed * _pct_indicacao / 100)::numeric, 2);

    IF _attendant_wallet_id IS NULL THEN
      SELECT id, balance INTO _attendant_wallet_id, _attendant_balance
      FROM public.wallets
      WHERE owner_id = _booking.driver_id AND owner_type = 'driver' FOR UPDATE;
    END IF;

    SELECT id, balance, total_earned INTO _referral_wallet_id, _referral_balance, _referral_total_earned
    FROM public.wallets
    WHERE owner_id = _booking.origin_driver_id AND owner_type = 'driver' FOR UPDATE;

    IF _attendant_wallet_id IS NOT NULL AND _referral_wallet_id IS NOT NULL AND _comissao_indicacao > 0 THEN
      _new_balance := _attendant_balance - _comissao_indicacao;
      UPDATE public.wallets SET balance = _new_balance, updated_at = now() WHERE id = _attendant_wallet_id;
      INSERT INTO public.wallet_transactions (wallet_id, tenant_id, type, amount, balance_after, description, reference_id)
      VALUES (_attendant_wallet_id, _booking.tenant_id, 'commission_service_referral',
              -_comissao_indicacao, _new_balance,
              'Comissão indicação serviço - ' || substr(_booking_id::text, 1, 8), _booking_id);

      _new_balance := _referral_balance + _comissao_indicacao;
      UPDATE public.wallets
        SET balance = _new_balance, total_earned = _referral_total_earned + _comissao_indicacao, updated_at = now()
        WHERE id = _referral_wallet_id;
      INSERT INTO public.wallet_transactions (wallet_id, tenant_id, type, amount, balance_after, description, reference_id)
      VALUES (_referral_wallet_id, _booking.tenant_id, 'commission_service_referral',
              _comissao_indicacao, _new_balance,
              'Receita indicação serviço - ' || substr(_booking_id::text, 1, 8), _booking_id);

      INSERT INTO public.commissions (booking_id, tenant_id, commission_type, amount, from_wallet_id, to_wallet_id, status, processed_at, commission_context)
      VALUES (_booking_id, _booking.tenant_id, 'service_referral', _comissao_indicacao,
              _attendant_wallet_id, _referral_wallet_id, 'processed', now(), 'servico');
    END IF;
  END IF;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, tenant_id, user_id, payload)
  VALUES ('service_commission_processed', 'service_booking', _booking_id, _booking.tenant_id, _booking.driver_id,
          jsonb_build_object(
            'price_agreed', _booking.price_agreed,
            'category_id', _category_id,
            'is_coverage', _booking.is_coverage,
            'cobertura', _comissao_cobertura,
            'indicacao', _comissao_indicacao,
            'rule_used', _has_rule
          ));

  RETURN jsonb_build_object(
    'processed', true,
    'service_coverage', _comissao_cobertura,
    'service_referral', _comissao_indicacao
  );
END;
$function$;