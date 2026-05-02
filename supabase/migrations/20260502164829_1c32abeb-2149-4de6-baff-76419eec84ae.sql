-- Fase 7: Recrutamento e recorrência

-- 1. Tabela de idempotência mensal
CREATE TABLE IF NOT EXISTS public.recruitment_monthly_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  recruiter_id uuid NOT NULL,
  recruited_id uuid NOT NULL,
  ano_mes text NOT NULL,                 -- formato YYYY-MM
  amount numeric NOT NULL,
  commission_id uuid,
  wallet_transaction_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_recruitment_monthly_payouts_ref_mes
  ON public.recruitment_monthly_payouts (referral_id, ano_mes);

CREATE INDEX IF NOT EXISTS idx_recruitment_monthly_payouts_recruiter
  ON public.recruitment_monthly_payouts (recruiter_id, ano_mes DESC);

ALTER TABLE public.recruitment_monthly_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiter views own payouts"
  ON public.recruitment_monthly_payouts FOR SELECT
  USING (recruiter_id = auth.uid());

CREATE POLICY "Tenant admins view payouts"
  ON public.recruitment_monthly_payouts FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid())
    AND get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role])
  );

-- 2. Função utilitária: encontra/cria wallet do recrutador (driver)
CREATE OR REPLACE FUNCTION public._ensure_driver_wallet(_driver_id uuid, _tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wid uuid;
BEGIN
  SELECT id INTO wid FROM public.wallets
  WHERE owner_id = _driver_id AND owner_type = 'driver'::wallet_owner_type
  LIMIT 1;

  IF wid IS NULL THEN
    INSERT INTO public.wallets (tenant_id, owner_type, owner_id, balance)
    VALUES (_tenant_id, 'driver'::wallet_owner_type, _driver_id, 0)
    RETURNING id INTO wid;
  END IF;

  RETURN wid;
END;
$$;

-- 3. Função: comissão de cadastro (10%)
CREATE OR REPLACE FUNCTION public.process_recruitment_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer uuid;
  v_plan_signup numeric;
  v_amount numeric;
  v_wallet_id uuid;
  v_balance numeric;
  v_commission_id uuid;
  v_wt_id uuid;
  v_referral_id uuid;
BEGIN
  v_referrer := NEW.referred_by;

  IF v_referrer IS NULL THEN
    RETURN NEW;
  END IF;

  -- Busca preço de cadastro do plano
  SELECT price_signup INTO v_plan_signup FROM public.plans WHERE id = NEW.plan_id;

  IF v_plan_signup IS NULL OR v_plan_signup <= 0 THEN
    RETURN NEW;
  END IF;

  v_amount := round(v_plan_signup * 0.10, 2);

  IF v_amount <= 0 THEN
    RETURN NEW;
  END IF;

  -- Localiza o owner do tenant assinante (referred_id) — quem está recebendo a indicação
  -- Cria/atualiza referral
  SELECT id INTO v_referral_id FROM public.referrals
  WHERE referrer_id = v_referrer
    AND tenant_id = NEW.tenant_id
    AND referral_type = 'driver'
  LIMIT 1;

  IF v_referral_id IS NULL THEN
    INSERT INTO public.referrals (
      tenant_id, referrer_id, referred_id, referral_type,
      signup_commission_paid, signup_commission_amount,
      monthly_commission_active
    )
    SELECT
      NEW.tenant_id, v_referrer,
      (SELECT owner_user_id FROM public.tenants WHERE id = NEW.tenant_id),
      'driver', true, v_amount, true
    RETURNING id INTO v_referral_id;
  ELSE
    UPDATE public.referrals
    SET signup_commission_paid = true,
        signup_commission_amount = v_amount,
        monthly_commission_active = true
    WHERE id = v_referral_id;
  END IF;

  -- Wallet do recrutador
  v_wallet_id := public._ensure_driver_wallet(v_referrer, NEW.tenant_id);

  -- Atualiza saldo
  UPDATE public.wallets
  SET balance = balance + v_amount,
      total_earned = total_earned + v_amount,
      updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance INTO v_balance;

  -- Registra commission
  INSERT INTO public.commissions (
    tenant_id, commission_type, commission_context,
    amount, to_wallet_id, status, processed_at
  )
  VALUES (
    NEW.tenant_id, 'referral'::commission_type, 'recrutamento',
    v_amount, v_wallet_id, 'paid'::commission_status, now()
  )
  RETURNING id INTO v_commission_id;

  -- Wallet transaction
  INSERT INTO public.wallet_transactions (
    wallet_id, tenant_id, type, amount, balance_after,
    reference_id, description
  )
  VALUES (
    v_wallet_id, NEW.tenant_id, 'commission_referral'::wallet_transaction_type,
    v_amount, v_balance, v_commission_id,
    'Comissão de cadastro (10%) por indicação de novo profissional'
  )
  RETURNING id INTO v_wt_id;

  -- Auditoria
  INSERT INTO public.audit_logs (tenant_id, user_id, action, entity_type, entity_id, payload)
  VALUES (
    NEW.tenant_id, v_referrer, 'recruitment_commission', 'subscription', NEW.id,
    jsonb_build_object(
      'tipo', 'cadastro',
      'percentual', 10,
      'valor', v_amount,
      'plan_id', NEW.plan_id,
      'referral_id', v_referral_id
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recruitment_signup ON public.subscriptions;
CREATE TRIGGER trg_recruitment_signup
AFTER INSERT ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.process_recruitment_signup();

-- 4. Função: processamento mensal (5%) — idempotente por (referral_id, ano_mes)
CREATE OR REPLACE FUNCTION public.process_recruitment_monthly()
RETURNS TABLE(processados int, total_pago numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ano_mes text := to_char(now(), 'YYYY-MM');
  v_processados int := 0;
  v_total numeric := 0;
  rec RECORD;
  v_amount numeric;
  v_wallet_id uuid;
  v_balance numeric;
  v_commission_id uuid;
  v_wt_id uuid;
BEGIN
  FOR rec IN
    SELECT
      r.id AS referral_id,
      r.tenant_id,
      r.referrer_id,
      r.referred_id,
      s.plan_id,
      s.id AS subscription_id,
      p.price_monthly
    FROM public.referrals r
    JOIN public.subscriptions s ON s.tenant_id = r.tenant_id AND s.status = 'active'::subscription_status
    JOIN public.plans p ON p.id = s.plan_id
    WHERE r.monthly_commission_active = true
      AND r.referral_type = 'driver'
      AND p.price_monthly > 0
      AND NOT EXISTS (
        SELECT 1 FROM public.recruitment_monthly_payouts pp
        WHERE pp.referral_id = r.id AND pp.ano_mes = v_ano_mes
      )
  LOOP
    v_amount := round(rec.price_monthly * 0.05, 2);
    IF v_amount <= 0 THEN CONTINUE; END IF;

    v_wallet_id := public._ensure_driver_wallet(rec.referrer_id, rec.tenant_id);

    UPDATE public.wallets
    SET balance = balance + v_amount,
        total_earned = total_earned + v_amount,
        updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_balance;

    INSERT INTO public.commissions (
      tenant_id, commission_type, commission_context,
      amount, to_wallet_id, status, processed_at
    )
    VALUES (
      rec.tenant_id, 'referral'::commission_type, 'recrutamento',
      v_amount, v_wallet_id, 'paid'::commission_status, now()
    )
    RETURNING id INTO v_commission_id;

    INSERT INTO public.wallet_transactions (
      wallet_id, tenant_id, type, amount, balance_after,
      reference_id, description
    )
    VALUES (
      v_wallet_id, rec.tenant_id, 'commission_referral'::wallet_transaction_type,
      v_amount, v_balance, v_commission_id,
      'Comissão recorrente (5%) por recrutamento ativo — ' || v_ano_mes
    )
    RETURNING id INTO v_wt_id;

    INSERT INTO public.recruitment_monthly_payouts (
      referral_id, tenant_id, recruiter_id, recruited_id,
      ano_mes, amount, commission_id, wallet_transaction_id
    )
    VALUES (
      rec.referral_id, rec.tenant_id, rec.referrer_id, rec.referred_id,
      v_ano_mes, v_amount, v_commission_id, v_wt_id
    );

    UPDATE public.referrals
    SET total_monthly_earned = total_monthly_earned + v_amount
    WHERE id = rec.referral_id;

    INSERT INTO public.audit_logs (tenant_id, user_id, action, entity_type, entity_id, payload)
    VALUES (
      rec.tenant_id, rec.referrer_id, 'recruitment_commission', 'subscription', rec.subscription_id,
      jsonb_build_object(
        'tipo', 'mensal',
        'percentual', 5,
        'valor', v_amount,
        'ano_mes', v_ano_mes,
        'referral_id', rec.referral_id
      )
    );

    v_processados := v_processados + 1;
    v_total := v_total + v_amount;
  END LOOP;

  processados := v_processados;
  total_pago := v_total;
  RETURN NEXT;
END;
$$;