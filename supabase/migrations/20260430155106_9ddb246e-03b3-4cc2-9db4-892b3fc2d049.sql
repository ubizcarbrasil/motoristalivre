
-- =========================================================
-- 1) Portfólio de serviços
-- =========================================================
CREATE TABLE public.service_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL,
  service_type_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_driver ON public.service_portfolio_items(driver_id);
CREATE INDEX idx_portfolio_service ON public.service_portfolio_items(service_type_id);

ALTER TABLE public.service_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view portfolio"
ON public.service_portfolio_items FOR SELECT
USING (true);

CREATE POLICY "Driver manages own portfolio"
ON public.service_portfolio_items FOR ALL
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Tenant admins manage portfolio"
ON public.service_portfolio_items FOR ALL
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
)
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

CREATE TRIGGER trg_portfolio_updated
BEFORE UPDATE ON public.service_portfolio_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2) Equipe / afiliados do profissional
-- =========================================================
CREATE TABLE public.professional_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_driver_id uuid NOT NULL,
  member_driver_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  headline text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_unique UNIQUE (owner_driver_id, member_driver_id),
  CONSTRAINT team_no_self CHECK (owner_driver_id <> member_driver_id)
);

CREATE INDEX idx_team_owner ON public.professional_team_members(owner_driver_id);
CREATE INDEX idx_team_member ON public.professional_team_members(member_driver_id);

ALTER TABLE public.professional_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view teams"
ON public.professional_team_members FOR SELECT
USING (true);

CREATE POLICY "Owner manages own team"
ON public.professional_team_members FOR ALL
USING (owner_driver_id = auth.uid())
WITH CHECK (owner_driver_id = auth.uid());

CREATE POLICY "Tenant admins manage teams"
ON public.professional_team_members FOR ALL
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
)
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

CREATE TRIGGER trg_team_updated
BEFORE UPDATE ON public.professional_team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validação: dono e membro precisam estar no mesmo tenant
CREATE OR REPLACE FUNCTION public.validate_team_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner_tenant uuid;
  _member_tenant uuid;
BEGIN
  SELECT tenant_id INTO _owner_tenant FROM public.drivers WHERE id = NEW.owner_driver_id;
  SELECT tenant_id INTO _member_tenant FROM public.drivers WHERE id = NEW.member_driver_id;

  IF _owner_tenant IS NULL OR _member_tenant IS NULL THEN
    RAISE EXCEPTION 'Dono ou membro não é um profissional válido';
  END IF;

  IF _owner_tenant <> _member_tenant THEN
    RAISE EXCEPTION 'Dono e membro precisam pertencer ao mesmo grupo';
  END IF;

  IF NEW.tenant_id <> _owner_tenant THEN
    NEW.tenant_id := _owner_tenant;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_team_member
BEFORE INSERT OR UPDATE ON public.professional_team_members
FOR EACH ROW EXECUTE FUNCTION public.validate_team_member();

-- =========================================================
-- 3) Sinal por serviço
-- =========================================================
ALTER TABLE public.service_types
  ADD COLUMN IF NOT EXISTS deposit_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric,
  ADD COLUMN IF NOT EXISTS deposit_percent numeric;

-- =========================================================
-- 4) Pagamentos de sinal
-- =========================================================
CREATE TABLE public.service_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  client_id uuid,
  tenant_id uuid NOT NULL,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON public.service_payments(booking_id);
CREATE INDEX idx_payments_session ON public.service_payments(stripe_session_id);

ALTER TABLE public.service_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client views own payments"
ON public.service_payments FOR SELECT
USING (client_id = auth.uid());

CREATE POLICY "Driver views own payments"
ON public.service_payments FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Tenant admins view payments"
ON public.service_payments FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

CREATE TRIGGER trg_payments_updated
BEFORE UPDATE ON public.service_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
