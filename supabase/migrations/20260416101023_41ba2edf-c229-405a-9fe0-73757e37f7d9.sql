
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

  IF _slug IS NOT NULL THEN
    SELECT id INTO _tenant_id FROM public.tenants WHERE slug = _slug LIMIT 1;
  END IF;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant not found for slug: %', COALESCE(_slug, '(empty)');
  END IF;

  INSERT INTO public.users (id, tenant_id, role, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    _tenant_id,
    _role,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
