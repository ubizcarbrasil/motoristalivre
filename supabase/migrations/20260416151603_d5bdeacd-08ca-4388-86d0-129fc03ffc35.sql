
CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(
  _name text,
  _slug text,
  _plan_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _tenant_id uuid;
  _user_id uuid := auth.uid();
  _auth_user record;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, raw_user_meta_data INTO _auth_user
  FROM auth.users WHERE id = _user_id;

  -- Create tenant
  INSERT INTO public.tenants (name, slug, owner_user_id, plan_id, status)
  VALUES (_name, _slug, _user_id, _plan_id, 'active')
  RETURNING id INTO _tenant_id;

  -- Upsert user profile
  INSERT INTO public.users (id, tenant_id, role, full_name, email, avatar_url)
  VALUES (
    _user_id,
    _tenant_id,
    'tenant_admin',
    COALESCE(_auth_user.raw_user_meta_data ->> 'full_name', _auth_user.raw_user_meta_data ->> 'name'),
    _auth_user.email,
    _auth_user.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = _tenant_id,
    role = 'tenant_admin',
    email = EXCLUDED.email;

  RETURN _tenant_id;
END;
$$;
