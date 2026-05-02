-- =====================================================================
-- Teste de validação: Motor de comissão de serviços (Fase 2)
-- =====================================================================
-- Como rodar:
--   psql -f supabase/tests/test_comissao_servicos.sql
--
-- Cobre 3 cenários ao concluir um service_booking:
--   1) Cobertura (is_coverage=true, origin_driver_id ≠ driver_id)
--      → deve gerar commission 'service_coverage' + 2 wallet_transactions
--   2) Indicação (is_coverage=false, origin_driver_id ≠ driver_id)
--      → deve gerar commission 'service_referral' + 2 wallet_transactions
--   3) Simples (sem origin_driver_id)
--      → NÃO deve gerar nenhuma commission
--
-- Tudo roda em transação e dá ROLLBACK no final (não polui o banco).
-- =====================================================================

BEGIN;

DO $$
DECLARE
  _tenant_id uuid;
  _category_id uuid;
  _driver_a uuid;  -- atendente
  _driver_b uuid;  -- origem (cobertura/indicação)
  _service_type_id uuid;
  _guest_id uuid;
  _booking_cobertura uuid;
  _booking_indicacao uuid;
  _booking_simples uuid;
  _wallet_a uuid;
  _wallet_b uuid;
  _saldo_a_inicial numeric := 1000;
  _saldo_b_inicial numeric := 500;
  _preco numeric := 200;
  _pct_cobertura numeric := 15;   -- 15% → R$ 30
  _pct_indicacao numeric := 10;   -- 10% → R$ 20
  _esperado_cobertura numeric := 30;
  _esperado_indicacao numeric := 20;
  _qtd_commissions int;
  _qtd_wallet_tx int;
  _saldo_a_final numeric;
  _saldo_b_final numeric;
  _commission_type text;
BEGIN
  -- Pega 2 drivers reais do mesmo tenant
  SELECT tenant_id INTO _tenant_id
  FROM public.drivers
  GROUP BY tenant_id
  HAVING count(*) >= 2
  LIMIT 1;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Precisa de pelo menos 2 drivers no mesmo tenant para o teste';
  END IF;

  SELECT id INTO _driver_a FROM public.drivers WHERE tenant_id = _tenant_id ORDER BY created_at LIMIT 1;
  SELECT id INTO _driver_b FROM public.drivers WHERE tenant_id = _tenant_id AND id <> _driver_a ORDER BY created_at LIMIT 1;

  RAISE NOTICE '=== Setup: tenant=% drv_a=% drv_b=% ===', _tenant_id, _driver_a, _driver_b;

  -- Garante tenant_settings (fallback se não houver regra)
  INSERT INTO public.tenant_settings (tenant_id, transbordo_commission, affiliate_commission)
  VALUES (_tenant_id, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Categoria de teste
  INSERT INTO public.service_categories (slug, nome, ordem)
  VALUES ('teste-comissao-' || substr(gen_random_uuid()::text, 1, 6), 'Teste Comissão', 999)
  RETURNING id INTO _category_id;

  -- Regra de comissão para a categoria
  INSERT INTO public.commission_rules (
    tenant_id, category_id, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl, ativo
  ) VALUES (
    _tenant_id, _category_id, _pct_cobertura, _pct_indicacao, 0, true
  );

  -- Carteiras: pega existente ou cria, e força saldo controlado para o teste
  SELECT id INTO _wallet_a FROM public.wallets WHERE owner_id = _driver_a AND owner_type = 'driver';
  IF _wallet_a IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_driver_a, 'driver', _tenant_id, _saldo_a_inicial, 0) RETURNING id INTO _wallet_a;
  ELSE
    UPDATE public.wallets SET balance = _saldo_a_inicial, blocked_balance = 0 WHERE id = _wallet_a;
  END IF;

  SELECT id INTO _wallet_b FROM public.wallets WHERE owner_id = _driver_b AND owner_type = 'driver';
  IF _wallet_b IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_driver_b, 'driver', _tenant_id, _saldo_b_inicial, 0) RETURNING id INTO _wallet_b;
  ELSE
    UPDATE public.wallets SET balance = _saldo_b_inicial, blocked_balance = 0 WHERE id = _wallet_b;
  END IF;

  -- Tipo de serviço vinculado à categoria
  INSERT INTO public.service_types (
    driver_id, tenant_id, name, duration_minutes, price, category_id, is_active
  ) VALUES (
    _driver_a, _tenant_id, 'Serviço teste', 60, _preco, _category_id, true
  ) RETURNING id INTO _service_type_id;

  -- Cliente convidado para satisfazer check constraint client_or_guest
  INSERT INTO public.guest_passengers (tenant_id, full_name, whatsapp)
  VALUES (_tenant_id, 'Cliente teste', '11999999999')
  RETURNING id INTO _guest_id;

  -- ============= CENÁRIO 1: COBERTURA =============
  RAISE NOTICE '--- Cenário 1: cobertura ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_type_id, now(),
    60, _preco, 'cash', 'pending',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking_cobertura;

  -- Dispara o trigger
  UPDATE public.service_bookings SET status = 'completed' WHERE id = _booking_cobertura;

  SELECT count(*), max(commission_type::text) INTO _qtd_commissions, _commission_type
  FROM public.commissions
  WHERE ride_id = _booking_cobertura AND commission_context = 'servico';

  ASSERT _qtd_commissions = 1,
    format('Cobertura: esperado 1 commission, obtido %s', _qtd_commissions);
  ASSERT _commission_type = 'service_coverage',
    format('Cobertura: esperado service_coverage, obtido %s', _commission_type);

  SELECT count(*) INTO _qtd_wallet_tx
  FROM public.wallet_transactions
  WHERE reference_id = _booking_cobertura
    AND type::text = 'commission_service_coverage';

  ASSERT _qtd_wallet_tx = 2,
    format('Cobertura: esperado 2 wallet_tx, obtido %s', _qtd_wallet_tx);

  RAISE NOTICE 'OK cobertura: 1 commission + 2 wallet_tx';

  -- ============= CENÁRIO 2: INDICAÇÃO =============
  RAISE NOTICE '--- Cenário 2: indicação ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_type_id, now(),
    60, _preco, 'cash', 'pending',
    false, _driver_b, _guest_id
  ) RETURNING id INTO _booking_indicacao;

  UPDATE public.service_bookings SET status = 'completed' WHERE id = _booking_indicacao;

  SELECT count(*), max(commission_type::text) INTO _qtd_commissions, _commission_type
  FROM public.commissions
  WHERE ride_id = _booking_indicacao AND commission_context = 'servico';

  ASSERT _qtd_commissions = 1,
    format('Indicação: esperado 1 commission, obtido %s', _qtd_commissions);
  ASSERT _commission_type = 'service_referral',
    format('Indicação: esperado service_referral, obtido %s', _commission_type);

  SELECT count(*) INTO _qtd_wallet_tx
  FROM public.wallet_transactions
  WHERE reference_id = _booking_indicacao
    AND type::text = 'commission_service_referral';

  ASSERT _qtd_wallet_tx = 2,
    format('Indicação: esperado 2 wallet_tx, obtido %s', _qtd_wallet_tx);

  RAISE NOTICE 'OK indicação: 1 commission + 2 wallet_tx';

  -- ============= CENÁRIO 3: SIMPLES (sem origem) =============
  RAISE NOTICE '--- Cenário 3: simples ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id
  ) VALUES (
    _tenant_id, _driver_a, _service_type_id, now(),
    60, _preco, 'cash', 'pending',
    false, NULL
  ) RETURNING id INTO _booking_simples;

  UPDATE public.service_bookings SET status = 'completed' WHERE id = _booking_simples;

  SELECT count(*) INTO _qtd_commissions
  FROM public.commissions
  WHERE ride_id = _booking_simples AND commission_context = 'servico';

  ASSERT _qtd_commissions = 0,
    format('Simples: esperado 0 commission, obtido %s', _qtd_commissions);

  RAISE NOTICE 'OK simples: nenhuma commission gerada';

  -- ============= VALIDA SALDOS FINAIS =============
  -- A pagou cobertura (-30) + indicação (-20) = -50
  -- B recebeu cobertura (+30) + indicação (+20) = +50
  SELECT balance INTO _saldo_a_final FROM public.wallets WHERE id = _wallet_a;
  SELECT balance INTO _saldo_b_final FROM public.wallets WHERE id = _wallet_b;

  ASSERT _saldo_a_final = _saldo_a_inicial - _esperado_cobertura - _esperado_indicacao,
    format('Saldo A: esperado %s, obtido %s',
           _saldo_a_inicial - _esperado_cobertura - _esperado_indicacao, _saldo_a_final);
  ASSERT _saldo_b_final = _saldo_b_inicial + _esperado_cobertura + _esperado_indicacao,
    format('Saldo B: esperado %s, obtido %s',
           _saldo_b_inicial + _esperado_cobertura + _esperado_indicacao, _saldo_b_final);

  RAISE NOTICE 'OK saldos: A=% (-%), B=% (+%)',
    _saldo_a_final, _saldo_a_inicial - _saldo_a_final,
    _saldo_b_final, _saldo_b_final - _saldo_b_inicial;

  -- ============= IDEMPOTÊNCIA =============
  RAISE NOTICE '--- Idempotência: reprocessar cobertura ---';
  PERFORM public.process_service_commission(_booking_cobertura);

  SELECT count(*) INTO _qtd_commissions
  FROM public.commissions
  WHERE ride_id = _booking_cobertura AND commission_context = 'servico';

  ASSERT _qtd_commissions = 1,
    format('Idempotência: esperado 1 commission após reprocesso, obtido %s', _qtd_commissions);

  RAISE NOTICE 'OK idempotência: reprocesso não duplica';

  RAISE NOTICE '======================================';
  RAISE NOTICE 'TODOS OS TESTES PASSARAM ✅';
  RAISE NOTICE '======================================';
END $$;

ROLLBACK;
