
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id uuid;
  _role app_role;
  _slug text;
BEGIN
  _slug := NEW.raw_user_meta_data ->> 'tenant_slug';
  _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'passenger');

  IF _slug IS NULL OR _slug = '' THEN
    RETURN NEW;
  END IF;

  SELECT id INTO _tenant_id FROM public.tenants WHERE slug = _slug LIMIT 1;

  IF _tenant_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (id, tenant_id, role, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    _tenant_id,
    _role,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
