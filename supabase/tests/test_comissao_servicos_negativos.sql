-- =====================================================================
-- Testes NEGATIVOS: process_service_commission (Fase 2)
-- =====================================================================
-- Como rodar:
--   psql -f supabase/tests/test_comissao_servicos_negativos.sql
--
-- Garante que o motor NÃO gera commissions nem wallet_transactions quando:
--   N1) booking.status <> 'completed' (ex.: 'pending', 'in_progress')
--   N2) price_agreed IS NULL
--   N3) price_agreed <= 0 (zero e negativo)
--   N4) Sem commission_rules para a categoria E tenant_settings zerado
--       (fallback resulta em pct=0 → não gera lançamento)
--   N5) origin_driver_id = driver_id (auto-indicação) → sem lançamento
--   N6) Idempotência: chamar 2x em booking já processado não duplica
--
-- Tudo roda em transação e dá ROLLBACK no final.
-- =====================================================================

BEGIN;

DO $$
DECLARE
  _tenant_id uuid;
  _category_sem_regra uuid;
  _category_com_regra uuid;
  _driver_a uuid;
  _driver_b uuid;
  _service_sem_regra uuid;
  _service_com_regra uuid;
  _guest_id uuid;
  _wallet_a uuid;
  _wallet_b uuid;
  _saldo_a_ini numeric := 1000;
  _saldo_b_ini numeric := 500;
  _saldo_a_pos numeric;
  _saldo_b_pos numeric;
  _booking uuid;
  _qtd_commissions int;
  _qtd_wallet_tx int;
  _result jsonb;
  _ts_transbordo numeric;
  _ts_affiliate numeric;
BEGIN
  -- Setup base
  SELECT tenant_id INTO _tenant_id
  FROM public.drivers
  GROUP BY tenant_id HAVING count(*) >= 2 LIMIT 1;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Precisa de pelo menos 2 drivers no mesmo tenant';
  END IF;

  SELECT id INTO _driver_a FROM public.drivers WHERE tenant_id = _tenant_id ORDER BY created_at LIMIT 1;
  SELECT id INTO _driver_b FROM public.drivers WHERE tenant_id = _tenant_id AND id <> _driver_a ORDER BY created_at LIMIT 1;

  RAISE NOTICE '=== Setup: tenant=% drv_a=% drv_b=% ===', _tenant_id, _driver_a, _driver_b;

  -- Garante linha em tenant_settings (sem alterar valores existentes — psql não tem grant de UPDATE)
  INSERT INTO public.tenant_settings (tenant_id, transbordo_commission, affiliate_commission)
  VALUES (_tenant_id, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Categoria SEM regra
  INSERT INTO public.service_categories (slug, nome, ordem)
  VALUES ('teste-neg-sem-regra-' || substr(gen_random_uuid()::text, 1, 6), 'Sem regra', 998)
  RETURNING id INTO _category_sem_regra;

  -- Categoria COM regra (para casos de status/preço inválido)
  INSERT INTO public.service_categories (slug, nome, ordem)
  VALUES ('teste-neg-com-regra-' || substr(gen_random_uuid()::text, 1, 6), 'Com regra', 997)
  RETURNING id INTO _category_com_regra;

  INSERT INTO public.commission_rules (
    tenant_id, category_id, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl, ativo
  ) VALUES (_tenant_id, _category_com_regra, 15, 10, 0, true);

  -- Carteiras com saldo controlado
  SELECT id INTO _wallet_a FROM public.wallets WHERE owner_id = _driver_a AND owner_type = 'driver';
  IF _wallet_a IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_driver_a, 'driver', _tenant_id, _saldo_a_ini, 0) RETURNING id INTO _wallet_a;
  END IF;

  SELECT id INTO _wallet_b FROM public.wallets WHERE owner_id = _driver_b AND owner_type = 'driver';
  IF _wallet_b IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_driver_b, 'driver', _tenant_id, _saldo_b_ini, 0) RETURNING id INTO _wallet_b;
  END IF;

  -- Tipos de serviço
  INSERT INTO public.service_types (driver_id, tenant_id, name, duration_minutes, price, category_id, is_active)
  VALUES (_driver_a, _tenant_id, 'Sv sem regra', 60, 200, _category_sem_regra, true)
  RETURNING id INTO _service_sem_regra;

  INSERT INTO public.service_types (driver_id, tenant_id, name, duration_minutes, price, category_id, is_active)
  VALUES (_driver_a, _tenant_id, 'Sv com regra', 60, 200, _category_com_regra, true)
  RETURNING id INTO _service_com_regra;

  INSERT INTO public.guest_passengers (tenant_id, full_name, whatsapp)
  VALUES (_tenant_id, 'Cliente teste neg', '11988887777')
  RETURNING id INTO _guest_id;

  -- =========================================================
  -- N1: status diferente de 'completed'
  -- =========================================================
  RAISE NOTICE '--- N1: status != completed ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_com_regra, now(),
    60, 200, 'cash', 'pending',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking;

  _result := public.process_service_commission(_booking);
  ASSERT (_result->>'skipped')::boolean = true,
    format('N1: esperava skipped=true, obtido %s', _result::text);

  SELECT count(*) INTO _qtd_commissions FROM public.commissions WHERE booking_id = _booking;
  ASSERT _qtd_commissions = 0, format('N1: esperava 0 commissions, obtido %s', _qtd_commissions);

  SELECT count(*) INTO _qtd_wallet_tx FROM public.wallet_transactions WHERE reference_id = _booking;
  ASSERT _qtd_wallet_tx = 0, format('N1: esperava 0 wallet_tx, obtido %s', _qtd_wallet_tx);
  RAISE NOTICE '  ✓ N1 ok (skipped, 0 commissions, 0 wallet_tx)';

  -- =========================================================
  -- N2: price_agreed NULL
  -- Observação: a coluna service_bookings.price_agreed é NOT NULL
  -- no schema, então este cenário é bloqueado pela própria DDL e
  -- nunca chega ao motor. Validamos via metadados:
  -- =========================================================
  RAISE NOTICE '--- N2: price_agreed NULL (bloqueado pela DDL) ---';
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='service_bookings'
      AND column_name='price_agreed' AND is_nullable='NO'
  ), 'N2: price_agreed deveria ser NOT NULL no schema';
  RAISE NOTICE '  ✓ N2 ok (NOT NULL no schema garante a proteção)';

  -- =========================================================
  -- N3a: price_agreed = 0
  -- =========================================================
  RAISE NOTICE '--- N3a: price_agreed = 0 ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_com_regra, now(),
    60, 0, 'cash', 'completed',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking;

  _result := public.process_service_commission(_booking);
  ASSERT (_result->>'skipped')::boolean = true,
    format('N3a: esperava skipped=true, obtido %s', _result::text);

  SELECT count(*) INTO _qtd_commissions FROM public.commissions WHERE booking_id = _booking;
  ASSERT _qtd_commissions = 0, format('N3a: esperava 0 commissions, obtido %s', _qtd_commissions);

  SELECT count(*) INTO _qtd_wallet_tx FROM public.wallet_transactions WHERE reference_id = _booking;
  ASSERT _qtd_wallet_tx = 0, format('N3a: esperava 0 wallet_tx, obtido %s', _qtd_wallet_tx);
  RAISE NOTICE '  ✓ N3a ok';

  -- =========================================================
  -- N3b: price_agreed negativo
  -- =========================================================
  RAISE NOTICE '--- N3b: price_agreed = -50 ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_com_regra, now(),
    60, -50, 'cash', 'completed',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking;

  _result := public.process_service_commission(_booking);
  ASSERT (_result->>'skipped')::boolean = true,
    format('N3b: esperava skipped=true, obtido %s', _result::text);

  SELECT count(*) INTO _qtd_commissions FROM public.commissions WHERE booking_id = _booking;
  ASSERT _qtd_commissions = 0, format('N3b: esperava 0 commissions, obtido %s', _qtd_commissions);
  RAISE NOTICE '  ✓ N3b ok';

  -- =========================================================
  -- N4: categoria sem commission_rules
  --     Se tenant_settings tiver pct>0, cria-se commission_rules com pct=0
  --     na própria categoria para forçar fallback inerte e validar que
  --     pct=0 ⇒ sem commissions / wallet_tx.
  -- =========================================================
  RAISE NOTICE '--- N4: sem regra efetiva (pct=0) ---';
  SELECT transbordo_commission, affiliate_commission
    INTO _ts_transbordo, _ts_affiliate
  FROM public.tenant_settings WHERE tenant_id = _tenant_id;

  IF COALESCE(_ts_transbordo, 0) > 0 OR COALESCE(_ts_affiliate, 0) > 0 THEN
    INSERT INTO public.commission_rules (
      tenant_id, category_id, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl, ativo
    ) VALUES (_tenant_id, _category_sem_regra, 0, 0, 0, true);
    RAISE NOTICE '  (tenant_settings>0 detectado: usando rule pct=0 para isolar o cenário)';
  END IF;

  -- Captura saldos atuais (sem resetar — RLS pode bloquear UPDATE direto)
  SELECT balance INTO _saldo_a_pos FROM public.wallets WHERE id = _wallet_a;
  SELECT balance INTO _saldo_b_pos FROM public.wallets WHERE id = _wallet_b;

  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_sem_regra, now(),
    60, 200, 'cash', 'completed',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking;

  _result := public.process_service_commission(_booking);

  SELECT count(*) INTO _qtd_commissions FROM public.commissions WHERE booking_id = _booking;
  ASSERT _qtd_commissions = 0,
    format('N4: esperava 0 commissions (pct=0), obtido %s', _qtd_commissions);

  SELECT count(*) INTO _qtd_wallet_tx FROM public.wallet_transactions WHERE reference_id = _booking;
  ASSERT _qtd_wallet_tx = 0,
    format('N4: esperava 0 wallet_tx (pct=0), obtido %s', _qtd_wallet_tx);

  -- Saldos não podem ter mudado (compara com snapshot pré-booking)
  ASSERT (SELECT balance FROM public.wallets WHERE id = _wallet_a) = _saldo_a_pos,
    'N4: saldo A não deveria ter mudado';
  ASSERT (SELECT balance FROM public.wallets WHERE id = _wallet_b) = _saldo_b_pos,
    'N4: saldo B não deveria ter mudado';
  RAISE NOTICE '  ✓ N4 ok (saldos preservados)';

  -- =========================================================
  -- N5: origin_driver_id = driver_id (auto-indicação)
  -- =========================================================
  RAISE NOTICE '--- N5: origin_driver_id = driver_id ---';
  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_com_regra, now(),
    60, 200, 'cash', 'completed',
    true, _driver_a, _guest_id  -- origem = atendente
  ) RETURNING id INTO _booking;

  _result := public.process_service_commission(_booking);

  SELECT count(*) INTO _qtd_commissions FROM public.commissions WHERE booking_id = _booking;
  ASSERT _qtd_commissions = 0,
    format('N5: esperava 0 commissions (auto-indicação), obtido %s', _qtd_commissions);
  RAISE NOTICE '  ✓ N5 ok';

  -- =========================================================
  -- N6: idempotência - reprocessar não duplica
  -- =========================================================
  RAISE NOTICE '--- N6: idempotência ---';
  UPDATE public.wallets SET balance = _saldo_a_ini, blocked_balance = 0 WHERE id = _wallet_a;
  UPDATE public.wallets SET balance = _saldo_b_ini, blocked_balance = 0 WHERE id = _wallet_b;

  INSERT INTO public.service_bookings (
    tenant_id, driver_id, service_type_id, scheduled_at,
    duration_minutes, price_agreed, payment_method, status,
    is_coverage, origin_driver_id, guest_passenger_id
  ) VALUES (
    _tenant_id, _driver_a, _service_com_regra, now(),
    60, 200, 'cash', 'completed',
    true, _driver_b, _guest_id
  ) RETURNING id INTO _booking;

  PERFORM public.process_service_commission(_booking);
  -- Segunda chamada deve retornar skipped
  _result := public.process_service_commission(_booking);
  ASSERT (_result->>'skipped')::boolean = true,
    format('N6: 2ª chamada deveria ser skipped, obtido %s', _result::text);

  SELECT count(*) INTO _qtd_commissions FROM public.commissions WHERE booking_id = _booking;
  ASSERT _qtd_commissions = 1,
    format('N6: esperava 1 commission após 2 chamadas, obtido %s', _qtd_commissions);

  SELECT count(*) INTO _qtd_wallet_tx FROM public.wallet_transactions WHERE reference_id = _booking;
  ASSERT _qtd_wallet_tx = 2,
    format('N6: esperava 2 wallet_tx após 2 chamadas, obtido %s', _qtd_wallet_tx);
  RAISE NOTICE '  ✓ N6 ok (idempotente)';

  RAISE NOTICE '=== TODOS OS TESTES NEGATIVOS PASSARAM ===';
END $$;

ROLLBACK;
