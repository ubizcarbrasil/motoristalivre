CREATE OR REPLACE FUNCTION public.ensure_driver_profile(_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _full_name text;
  _slug text;
  _existing_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verifica se tribo existe e se o user é dono
  IF NOT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE id = _tenant_id AND owner_user_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Apenas o dono da tribo pode ativar modo motorista nela';
  END IF;

  -- Já existe perfil driver?
  SELECT id INTO _existing_id
  FROM public.drivers
  WHERE id = _user_id AND tenant_id = _tenant_id
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RETURN _existing_id;
  END IF;

  -- Garante linha em users no tenant correto
  INSERT INTO public.users (id, tenant_id, role, full_name, email, avatar_url)
  SELECT
    _user_id,
    _tenant_id,
    'driver',
    COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
    email,
    raw_user_meta_data ->> 'avatar_url'
  FROM auth.users WHERE id = _user_id
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = _tenant_id,
    role = CASE
      WHEN public.users.role = 'passenger' THEN 'driver'::app_role
      ELSE public.users.role
    END,
    updated_at = now();

  -- Pega nome para gerar slug
  SELECT full_name INTO _full_name FROM public.users WHERE id = _user_id;

  _slug := public.generate_driver_slug(_full_name, _tenant_id);

  -- Cria perfil driver (dono é auto-verificado)
  INSERT INTO public.drivers (id, tenant_id, slug, is_online, is_verified)
  VALUES (_user_id, _tenant_id, _slug, false, true);

  RETURN _user_id;
END;
$function$;