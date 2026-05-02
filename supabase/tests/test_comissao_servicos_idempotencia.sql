-- =====================================================================
-- Teste de IDEMPOTÊNCIA: process_service_commission (Fase 2)
-- =====================================================================
-- Como rodar:
--   psql -f supabase/tests/test_comissao_servicos_idempotencia.sql
--
-- Garante que reexecutar process_service_commission várias vezes para o
-- mesmo booking_id:
--   • NÃO duplica registros em public.commissions
--   • NÃO duplica registros em public.wallet_transactions
--   • NÃO altera novamente os saldos das carteiras envolvidas
--   • Retorna skipped=true a partir da 2ª chamada
--
-- Cobre 2 cenários (cobertura e indicação) e executa 5 chamadas em cada.
-- Roda em transação e dá ROLLBACK no final.
-- =====================================================================

BEGIN;

DO $$
DECLARE
  _tenant_id uuid;
  _category_id uuid;
  _driver_a uuid;
  _driver_b uuid;
  _service_type_id uuid;
  _guest_id uuid;
  _wallet_a uuid;
  _wallet_b uuid;
  _booking_cobertura uuid;
  _booking_indicacao uuid;

  -- snapshots após a 1ª execução
  _saldo_a_pos1 numeric;
  _saldo_b_pos1 numeric;
  _saldo_a_atual numeric;
  _saldo_b_atual numeric;

  _qtd_commissions int;
  _qtd_wallet_tx int;
  _result jsonb;
  _i int;
BEGIN
  -- ====== Setup base ======
  SELECT tenant_id INTO _tenant_id
  FROM public.drivers
  GROUP BY tenant_id HAVING count(*) >= 2 LIMIT 1;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Precisa de pelo menos 2 drivers no mesmo tenant';
  END IF;

  SELECT id INTO _driver_a FROM public.drivers WHERE tenant_id = _tenant_id ORDER BY created_at LIMIT 1;
  SELECT id INTO _driver_b FROM public.drivers WHERE tenant_id = _tenant_id AND id <> _driver_a ORDER BY created_at LIMIT 1;

  RAISE NOTICE '=== Setup: tenant=% drv_a=% drv_b=% ===', _tenant_id, _driver_a, _driver_b;

  INSERT INTO public.tenant_settings (tenant_id, transbordo_commission, affiliate_commission)
  VALUES (_tenant_id, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Categoria + regra
  INSERT INTO public.service_categories (slug, nome, ordem)
  VALUES ('teste-idemp-' || substr(gen_random_uuid()::text, 1, 6), 'Idempotência', 996)
  RETURNING id INTO _category_id;

  INSERT INTO public.commission_rules (
    tenant_id, category_id, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl, ativo
  ) VALUES (_tenant_id, _category_id, 15, 10, 0, true);

  -- Carteiras (sem reset — RLS pode bloquear UPDATE direto; comparamos por delta)
  SELECT id INTO _wallet_a FROM public.wallets WHERE owner_id = _driver_a AND owner_type = 'driver';
  IF _wallet_a IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_driver_a, 'driver', _tenant_id, 1000, 0) RETURNING id INTO _wallet_a;
  END IF;

  SELECT id INTO _wallet_b FROM public.wallets WHERE owner_id = _driver_b AND owner_type = 'driver';
  IF _wallet_b IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_driver_b, 'driver', _tenant_id, 500, 0) RETURNING id INTO _wallet_b;
  END IF;

  INSERT INTO public.service_types (driver_id, tenant_id, name, duration_minutes, price, category_id, is_active)
  VALUES (_driver_a, _tenant_id, 'Sv idemp', 60, 200, _category_id, true)
  RETURNING id INTO _service_type_id;

  INSERT INTO public.guest_passengers (tenant_id, full_name, whatsapp)
  VALUES (_tenant_id, 'Cliente idemp', '11977776666')
  RETURNING id INTO _guest_id;

  -- =========================================================
  -- CENÁRIO A: COBERTURA — 5 execuções
  -- =========================================================
  RAISE NOTICE '--- A: cobertura, 5 execuções ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_type_id, now(),
    60, 200, 'cash', 'completed',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking_cobertura;

  -- 1ª execução: deve processar
  _result := public.process_service_commission(_booking_cobertura);
  ASSERT (_result->>'skipped') IS NULL OR (_result->>'skipped')::boolean = false,
    format('A: 1ª chamada não deveria ser skipped, obtido %s', _result::text);

  -- snapshot após 1ª
  SELECT balance INTO _saldo_a_pos1 FROM public.wallets WHERE id = _wallet_a;
  SELECT balance INTO _saldo_b_pos1 FROM public.wallets WHERE id = _wallet_b;

  -- 2ª…5ª execuções: devem ser skipped e NÃO alterar nada
  FOR _i IN 2..5 LOOP
    _result := public.process_service_commission(_booking_cobertura);
    ASSERT (_result->>'skipped')::boolean = true,
      format('A: chamada #%s deveria ser skipped, obtido %s', _i, _result::text);

    SELECT count(*) INTO _qtd_commissions
    FROM public.commissions WHERE booking_id = _booking_cobertura;
    ASSERT _qtd_commissions = 1,
      format('A: após chamada #%s, esperado 1 commission, obtido %s', _i, _qtd_commissions);

    SELECT count(*) INTO _qtd_wallet_tx
    FROM public.wallet_transactions WHERE reference_id = _booking_cobertura;
    ASSERT _qtd_wallet_tx = 2,
      format('A: após chamada #%s, esperado 2 wallet_tx, obtido %s', _i, _qtd_wallet_tx);

    SELECT balance INTO _saldo_a_atual FROM public.wallets WHERE id = _wallet_a;
    SELECT balance INTO _saldo_b_atual FROM public.wallets WHERE id = _wallet_b;
    ASSERT _saldo_a_atual = _saldo_a_pos1,
      format('A: saldo A mudou na chamada #%s (%s → %s)', _i, _saldo_a_pos1, _saldo_a_atual);
    ASSERT _saldo_b_atual = _saldo_b_pos1,
      format('A: saldo B mudou na chamada #%s (%s → %s)', _i, _saldo_b_pos1, _saldo_b_atual);
  END LOOP;
  RAISE NOTICE '  ✓ A ok: 5 execuções, 1 commission, 2 wallet_tx, saldos estáveis';

  -- =========================================================
  -- CENÁRIO B: INDICAÇÃO — 5 execuções
  -- =========================================================
  RAISE NOTICE '--- B: indicação, 5 execuções ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_type_id, now(),
    60, 200, 'cash', 'completed',
    false, _driver_b, _guest_id
  ) RETURNING id INTO _booking_indicacao;

  _result := public.process_service_commission(_booking_indicacao);
  ASSERT (_result->>'skipped') IS NULL OR (_result->>'skipped')::boolean = false,
    format('B: 1ª chamada não deveria ser skipped, obtido %s', _result::text);

  SELECT balance INTO _saldo_a_pos1 FROM public.wallets WHERE id = _wallet_a;
  SELECT balance INTO _saldo_b_pos1 FROM public.wallets WHERE id = _wallet_b;

  FOR _i IN 2..5 LOOP
    _result := public.process_service_commission(_booking_indicacao);
    ASSERT (_result->>'skipped')::boolean = true,
      format('B: chamada #%s deveria ser skipped, obtido %s', _i, _result::text);

    SELECT count(*) INTO _qtd_commissions
    FROM public.commissions WHERE booking_id = _booking_indicacao;
    ASSERT _qtd_commissions = 1,
      format('B: após chamada #%s, esperado 1 commission, obtido %s', _i, _qtd_commissions);

    SELECT count(*) INTO _qtd_wallet_tx
    FROM public.wallet_transactions WHERE reference_id = _booking_indicacao;
    ASSERT _qtd_wallet_tx = 2,
      format('B: após chamada #%s, esperado 2 wallet_tx, obtido %s', _i, _qtd_wallet_tx);

    SELECT balance INTO _saldo_a_atual FROM public.wallets WHERE id = _wallet_a;
    SELECT balance INTO _saldo_b_atual FROM public.wallets WHERE id = _wallet_b;
    ASSERT _saldo_a_atual = _saldo_a_pos1,
      format('B: saldo A mudou na chamada #%s (%s → %s)', _i, _saldo_a_pos1, _saldo_a_atual);
    ASSERT _saldo_b_atual = _saldo_b_pos1,
      format('B: saldo B mudou na chamada #%s (%s → %s)', _i, _saldo_b_pos1, _saldo_b_atual);
  END LOOP;
  RAISE NOTICE '  ✓ B ok: 5 execuções, 1 commission, 2 wallet_tx, saldos estáveis';

  RAISE NOTICE '=== IDEMPOTÊNCIA VALIDADA ✅ ===';
END $$;

ROLLBACK;
