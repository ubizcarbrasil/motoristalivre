
CREATE OR REPLACE FUNCTION public.ensure_user_profile(_tenant_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id uuid;
  _user_record record;
BEGIN
  SELECT * INTO _user_record FROM public.users WHERE id = auth.uid();
  IF FOUND THEN
    RETURN;
  END IF;

  SELECT id INTO _tenant_id FROM public.tenants WHERE slug = _tenant_slug LIMIT 1;
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant not found for slug: %', _tenant_slug;
  END IF;

  INSERT INTO public.users (id, tenant_id, role, full_name, email, avatar_url)
  SELECT
    auth.uid(),
    _tenant_id,
    'passenger',
    COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
    email,
    raw_user_meta_data ->> 'avatar_url'
  FROM auth.users WHERE id = auth.uid()
  ON CONFLICT (id) DO NOTHING;
END;
$$;
