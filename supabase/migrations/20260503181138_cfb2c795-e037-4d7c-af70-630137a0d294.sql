-- RPC para o profissional sair de uma tribo onde é apenas membro (não dono).
-- Marca a vinculação como inativa em tribe_members.

CREATE OR REPLACE FUNCTION public.fn_leave_tribe(_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT owner_user_id INTO v_owner FROM public.tenants WHERE id = _tenant_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'tribe_not_found';
  END IF;

  IF v_owner = v_user THEN
    RAISE EXCEPTION 'owner_cannot_leave';
  END IF;

  UPDATE public.tribe_members
     SET is_active = false, updated_at = now()
   WHERE tenant_id = _tenant_id
     AND driver_id = v_user;

  -- Se essa era a tribo principal do driver, desvincula
  UPDATE public.drivers
     SET tenant_id = NULL, updated_at = now()
   WHERE id = v_user
     AND tenant_id = _tenant_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_leave_tribe(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_leave_tribe(uuid) TO authenticated;