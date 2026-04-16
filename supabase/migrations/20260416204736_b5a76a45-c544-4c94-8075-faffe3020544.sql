-- Tabela de convites e solicitações entre motoristas e grupos (tenants)
CREATE TYPE public.invite_direction AS ENUM ('invite_from_group', 'request_from_driver');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

CREATE TABLE public.driver_group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  direction public.invite_direction NOT NULL,
  status public.invite_status NOT NULL DEFAULT 'pending',
  message text,
  expires_at timestamptz,
  created_by uuid,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dgi_driver ON public.driver_group_invites(driver_id, status);
CREATE INDEX idx_dgi_tenant ON public.driver_group_invites(tenant_id, status);
CREATE UNIQUE INDEX idx_dgi_unique_pending
  ON public.driver_group_invites(tenant_id, driver_id, direction)
  WHERE status = 'pending';

ALTER TABLE public.driver_group_invites ENABLE ROW LEVEL SECURITY;

-- Motorista vê os próprios convites/solicitações
CREATE POLICY "Drivers can view own invites"
  ON public.driver_group_invites FOR SELECT
  USING (driver_id = auth.uid());

-- Tenant admins/managers veem os do seu tenant
CREATE POLICY "Tenant admins can view tenant invites"
  ON public.driver_group_invites FOR SELECT
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
  );

-- Motorista cria solicitações (request_from_driver) para si mesmo
CREATE POLICY "Drivers can create own requests"
  ON public.driver_group_invites FOR INSERT
  WITH CHECK (
    driver_id = auth.uid()
    AND direction = 'request_from_driver'
    AND status = 'pending'
  );

-- Tenant admin cria convites (invite_from_group) do seu tenant
CREATE POLICY "Tenant admins can create invites"
  ON public.driver_group_invites FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND direction = 'invite_from_group'
    AND status = 'pending'
    AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
  );

-- Motorista responde aos próprios convites
CREATE POLICY "Drivers can respond own invites"
  ON public.driver_group_invites FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Tenant admin responde solicitações do seu tenant
CREATE POLICY "Tenant admins can respond requests"
  ON public.driver_group_invites FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
  )
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Trigger updated_at
CREATE TRIGGER update_dgi_updated_at
  BEFORE UPDATE ON public.driver_group_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();