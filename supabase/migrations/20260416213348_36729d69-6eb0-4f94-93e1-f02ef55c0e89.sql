-- 1) Função para motorista solicitar entrada num grupo (cria registro em driver_group_invites)
CREATE OR REPLACE FUNCTION public.request_driver_join(_tenant_slug text, _message text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _tenant_id uuid;
  _existing uuid;
  _invite_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO _tenant_id FROM public.tenants WHERE slug = _tenant_slug LIMIT 1;
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Grupo não encontrado: %', _tenant_slug;
  END IF;

  -- Garante que existe linha em public.users no tenant correto
  INSERT INTO public.users (id, tenant_id, role, full_name, email, avatar_url)
  SELECT
    _user_id,
    _tenant_id,
    'passenger',
    COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
    email,
    raw_user_meta_data ->> 'avatar_url'
  FROM auth.users WHERE id = _user_id
  ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

  -- Se já é motorista do tenant, não cria solicitação
  IF EXISTS (SELECT 1 FROM public.drivers WHERE id = _user_id AND tenant_id = _tenant_id) THEN
    RAISE EXCEPTION 'Você já é motorista deste grupo';
  END IF;

  -- Reaproveita solicitação pendente se já existir
  SELECT id INTO _existing
  FROM public.driver_group_invites
  WHERE driver_id = _user_id AND tenant_id = _tenant_id AND status = 'pending'
  LIMIT 1;

  IF _existing IS NOT NULL THEN
    RETURN _existing;
  END IF;

  INSERT INTO public.driver_group_invites (
    tenant_id, driver_id, direction, status, message, created_by
  ) VALUES (
    _tenant_id, _user_id, 'request_from_driver', 'pending', _message, _user_id
  ) RETURNING id INTO _invite_id;

  RETURN _invite_id;
END;
$$;

-- 2) Helper para gerar slug a partir do nome
CREATE OR REPLACE FUNCTION public.generate_driver_slug(_full_name text, _tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _base text;
  _slug text;
  _i int := 0;
BEGIN
  _base := lower(regexp_replace(coalesce(_full_name, 'motorista'), '[^a-zA-Z0-9]+', '-', 'g'));
  _base := trim(both '-' from _base);
  IF _base = '' THEN _base := 'motorista'; END IF;

  _slug := _base;
  WHILE EXISTS (SELECT 1 FROM public.drivers WHERE slug = _slug AND tenant_id = _tenant_id) LOOP
    _i := _i + 1;
    _slug := _base || '-' || _i::text;
  END LOOP;

  RETURN _slug;
END;
$$;

-- 3) Trigger: quando convite vira accepted, cria/atualiza driver e promove role
CREATE OR REPLACE FUNCTION public.handle_driver_invite_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text;
  _slug text;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    -- promove role para driver
    UPDATE public.users
    SET role = 'driver', tenant_id = NEW.tenant_id, updated_at = now()
    WHERE id = NEW.driver_id;

    SELECT full_name INTO _full_name FROM public.users WHERE id = NEW.driver_id;

    IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE id = NEW.driver_id) THEN
      _slug := public.generate_driver_slug(_full_name, NEW.tenant_id);
      INSERT INTO public.drivers (id, tenant_id, slug, is_online, is_verified)
      VALUES (NEW.driver_id, NEW.tenant_id, _slug, false, false);
    END IF;

    NEW.responded_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_driver_invite_accepted ON public.driver_group_invites;
CREATE TRIGGER trg_driver_invite_accepted
BEFORE UPDATE ON public.driver_group_invites
FOR EACH ROW
EXECUTE FUNCTION public.handle_driver_invite_accepted();