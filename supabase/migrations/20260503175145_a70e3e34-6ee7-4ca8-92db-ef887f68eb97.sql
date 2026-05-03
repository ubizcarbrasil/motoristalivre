-- =========================================================
-- FASE 2: TRIBO PROFISSIONAL — MIGRATION CONSOLIDADA
-- =========================================================

-- 1) TENANTS (= TRIBOS): novas colunas
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS service_category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS signup_slug text,
  ADD COLUMN IF NOT EXISTS is_owner_provider boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_visible_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tribe_setup_pending boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_signup_slug_unique
  ON public.tenants (signup_slug) WHERE signup_slug IS NOT NULL;

-- 2) DRIVERS: tenant_id opcional + categoria principal + flag pendência
ALTER TABLE public.drivers
  ALTER COLUMN tenant_id DROP NOT NULL;

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS primary_service_category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tribe_setup_pending boolean NOT NULL DEFAULT false;

-- 3) TRIBE_MEMBERS (relação N:N profissional <-> tribo)
CREATE TABLE IF NOT EXISTS public.tribe_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'provider', -- 'owner' | 'provider' | 'manager'
  commission_percent numeric(5,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_tribe_members_tenant ON public.tribe_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tribe_members_driver ON public.tribe_members(driver_id);

ALTER TABLE public.tribe_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_tribe_members_updated_at
  BEFORE UPDATE ON public.tribe_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS tribe_members
CREATE POLICY "Membros veem própria tribo"
  ON public.tribe_members FOR SELECT
  USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = tribe_members.tenant_id AND t.owner_user_id = auth.uid()
    )
    OR public.is_root_admin(auth.uid())
  );

CREATE POLICY "Dono da tribo gerencia membros"
  ON public.tribe_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = tribe_members.tenant_id AND t.owner_user_id = auth.uid()
    )
    OR public.is_root_admin(auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = tribe_members.tenant_id AND t.owner_user_id = auth.uid()
    )
    OR public.is_root_admin(auth.uid())
  );

-- 4) LEADS (potenciais clientes vindos por links)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  source_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  assigned_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  service_category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new', -- 'new' | 'contacted' | 'won' | 'lost'
  amount_won numeric(12,2),
  won_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_tenant ON public.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_source_driver ON public.leads(source_driver_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_driver ON public.leads(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Leads visíveis para envolvidos"
  ON public.leads FOR SELECT
  USING (
    source_driver_id = auth.uid()
    OR assigned_driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = leads.tenant_id AND t.owner_user_id = auth.uid()
    )
    OR public.is_root_admin(auth.uid())
  );

CREATE POLICY "Lead pode ser criado publicamente"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Dono/atendente atualiza lead"
  ON public.leads FOR UPDATE
  USING (
    assigned_driver_id = auth.uid()
    OR source_driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = leads.tenant_id AND t.owner_user_id = auth.uid()
    )
    OR public.is_root_admin(auth.uid())
  );

-- 5) COMMISSION_LEDGER (registro de comissões por lead)
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  payer_driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  receiver_driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'referral', -- 'referral' | 'management'
  base_amount numeric(12,2) NOT NULL,
  commission_percent numeric(5,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'cancelled'
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_tenant ON public.commission_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_payer ON public.commission_ledger(payer_driver_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_receiver ON public.commission_ledger(receiver_driver_id);

ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_commission_ledger_updated_at
  BEFORE UPDATE ON public.commission_ledger
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Comissões visíveis para envolvidos"
  ON public.commission_ledger FOR SELECT
  USING (
    payer_driver_id = auth.uid()
    OR receiver_driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = commission_ledger.tenant_id AND t.owner_user_id = auth.uid()
    )
    OR public.is_root_admin(auth.uid())
  );

CREATE POLICY "Apenas root admin gerencia ledger"
  ON public.commission_ledger FOR ALL
  USING (public.is_root_admin(auth.uid()))
  WITH CHECK (public.is_root_admin(auth.uid()));

-- 6) Função para gerar signup_slug único por tribo
CREATE OR REPLACE FUNCTION public.generate_signup_slug(_base text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  base text;
  candidate text;
  suffix int := 0;
BEGIN
  base := lower(extensions.unaccent(coalesce(_base, '')));
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '^-+|-+$', '', 'g');

  IF length(base) < 3 THEN
    base := 'tribo-' || substring(md5(random()::text) from 1 for 6);
  END IF;

  IF length(base) > 40 THEN
    base := substring(base from 1 for 40);
    base := regexp_replace(base, '-+$', '', 'g');
  END IF;

  candidate := base;

  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE signup_slug = candidate) LOOP
    suffix := suffix + 1;
    candidate := base || '-' || suffix::text;
    IF suffix > 9999 THEN
      candidate := base || '-' || substring(md5(random()::text) from 1 for 6);
      EXIT;
    END IF;
  END LOOP;

  RETURN candidate;
END;
$$;

-- 7) Backfill: marca profissionais existentes como pendentes de configuração de tribo
UPDATE public.drivers
SET tribe_setup_pending = true
WHERE tribe_setup_pending = false
  AND primary_service_category_id IS NULL;

-- Marca tenants existentes como pendentes se não tiverem categoria
UPDATE public.tenants
SET tribe_setup_pending = true
WHERE service_category_id IS NULL
  AND tribe_setup_pending = false;