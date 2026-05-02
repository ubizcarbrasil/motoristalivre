-- Tabela de convites de espelhamento de equipe
-- Quando profissional A adiciona B na equipe dele, ele pode propor que B também adicione A
-- O convite só vira espelhamento se B aceitar.

CREATE TYPE public.team_mirror_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE public.team_mirror_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  inviter_driver_id uuid NOT NULL,
  invitee_driver_id uuid NOT NULL,
  status team_mirror_status NOT NULL DEFAULT 'pending',
  message text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_mirror_invites_distinct CHECK (inviter_driver_id <> invitee_driver_id),
  CONSTRAINT team_mirror_invites_unique_pending UNIQUE (inviter_driver_id, invitee_driver_id, status)
);

CREATE INDEX idx_team_mirror_invites_invitee ON public.team_mirror_invites (invitee_driver_id, status);
CREATE INDEX idx_team_mirror_invites_inviter ON public.team_mirror_invites (inviter_driver_id, status);

ALTER TABLE public.team_mirror_invites ENABLE ROW LEVEL SECURITY;

-- Inviter cria convite (sempre como pending; tem que ser do mesmo tenant)
CREATE POLICY "Inviter creates invite"
ON public.team_mirror_invites
FOR INSERT
WITH CHECK (
  inviter_driver_id = auth.uid()
  AND status = 'pending'
  AND tenant_id = public.get_user_tenant_id(auth.uid())
);

-- Inviter e invitee veem o convite
CREATE POLICY "Parties view own invites"
ON public.team_mirror_invites
FOR SELECT
USING (inviter_driver_id = auth.uid() OR invitee_driver_id = auth.uid());

-- Só invitee pode aceitar/recusar (mudar status)
CREATE POLICY "Invitee responds"
ON public.team_mirror_invites
FOR UPDATE
USING (invitee_driver_id = auth.uid())
WITH CHECK (invitee_driver_id = auth.uid());

-- Inviter pode cancelar (deletar pending)
CREATE POLICY "Inviter cancels pending"
ON public.team_mirror_invites
FOR DELETE
USING (inviter_driver_id = auth.uid() AND status = 'pending');

-- Tenant admins podem ver tudo do tenant
CREATE POLICY "Tenant admins view"
ON public.team_mirror_invites
FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

CREATE TRIGGER update_team_mirror_invites_updated_at
BEFORE UPDATE ON public.team_mirror_invites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Quando aceito, automaticamente cria a relação de equipe na direção do invitee
-- (invitee passa a mostrar inviter no perfil dele)
CREATE OR REPLACE FUNCTION public.handle_team_mirror_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    NEW.responded_at := now();
    -- Cria relação espelhada se ainda não existir
    INSERT INTO public.professional_team_members (
      tenant_id, owner_driver_id, member_driver_id, ordem, headline
    )
    SELECT NEW.tenant_id, NEW.invitee_driver_id, NEW.inviter_driver_id,
           COALESCE((SELECT MAX(ordem) + 1 FROM public.professional_team_members WHERE owner_driver_id = NEW.invitee_driver_id), 0),
           NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM public.professional_team_members
      WHERE owner_driver_id = NEW.invitee_driver_id
        AND member_driver_id = NEW.inviter_driver_id
    );
  ELSIF NEW.status = 'declined' AND (OLD.status IS DISTINCT FROM 'declined') THEN
    NEW.responded_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_mirror_accepted
BEFORE UPDATE ON public.team_mirror_invites
FOR EACH ROW
EXECUTE FUNCTION public.handle_team_mirror_accepted();