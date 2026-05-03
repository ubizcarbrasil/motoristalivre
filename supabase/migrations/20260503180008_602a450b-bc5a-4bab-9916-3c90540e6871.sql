-- =========================================================
-- FASE 3: funções de apoio à Tribo Profissional
-- =========================================================

-- 1) Resolver tribo pelo signup_slug (público, leitura mínima)
CREATE OR REPLACE FUNCTION public.fn_resolve_tribe_by_signup_slug(_signup_slug text)
RETURNS TABLE (
  tenant_id uuid,
  tenant_name text,
  tenant_slug text,
  service_category_id uuid,
  service_category_slug text,
  service_category_name text,
  owner_user_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    t.id,
    t.name,
    t.slug,
    t.service_category_id,
    sc.slug,
    sc.nome,
    t.owner_user_id
  FROM public.tenants t
  LEFT JOIN public.service_categories sc ON sc.id = t.service_category_id
  WHERE t.signup_slug = lower(_signup_slug)
  LIMIT 1;
$$;

-- 2) Configurar tribo do dono: define categoria + signup_slug + member owner
CREATE OR REPLACE FUNCTION public.fn_setup_tribe_for_owner(
  _tenant_id uuid,
  _service_category_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _tenant record;
  _slug text;
  _slug_base text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _tenant FROM public.tenants WHERE id = _tenant_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tribo não encontrada';
  END IF;
  IF _tenant.owner_user_id <> _user_id THEN
    RAISE EXCEPTION 'Apenas o dono pode configurar a tribo';
  END IF;

  -- Gera signup_slug se ainda não existir
  IF _tenant.signup_slug IS NULL OR length(_tenant.signup_slug) = 0 THEN
    _slug_base := COALESCE(_tenant.slug, _tenant.name, 'tribo');
    _slug := public.generate_signup_slug(_slug_base);
  ELSE
    _slug := _tenant.signup_slug;
  END IF;

  UPDATE public.tenants
  SET service_category_id = COALESCE(_service_category_id, service_category_id),
      signup_slug = _slug,
      is_owner_provider = COALESCE(is_owner_provider, true),
      is_visible_public = COALESCE(is_visible_public, true),
      tribe_setup_pending = false,
      updated_at = now()
  WHERE id = _tenant_id;

  -- Atualiza driver dono com categoria primária
  UPDATE public.drivers
  SET primary_service_category_id = COALESCE(_service_category_id, primary_service_category_id),
      tribe_setup_pending = false,
      updated_at = now()
  WHERE id = _user_id;

  -- Garante membro owner
  INSERT INTO public.tribe_members (tenant_id, driver_id, role, commission_percent, is_active)
  VALUES (_tenant_id, _user_id, 'owner', 0, true)
  ON CONFLICT (tenant_id, driver_id) DO UPDATE
    SET role = 'owner', is_active = true, updated_at = now();

  RETURN _slug;
END;
$$;

-- 3) Entrar em tribo via signup_slug (profissional autenticado)
CREATE OR REPLACE FUNCTION public.fn_join_tribe_by_signup_slug(
  _signup_slug text,
  _commission_percent numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _tenant_id uuid;
  _member_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO _tenant_id
  FROM public.tenants
  WHERE signup_slug = lower(_signup_slug)
  LIMIT 1;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Link da tribo inválido';
  END IF;

  -- Garante que existe driver para o user (sem tenant primário, opcional)
  IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE id = _user_id) THEN
    INSERT INTO public.drivers (id, slug, professional_type, tribe_setup_pending)
    VALUES (
      _user_id,
      'pro-' || substring(md5(random()::text) from 1 for 8),
      'service_provider',
      true
    );
  END IF;

  -- Insert ou reativa vínculo
  INSERT INTO public.tribe_members (tenant_id, driver_id, role, commission_percent, is_active)
  VALUES (_tenant_id, _user_id, 'provider', COALESCE(_commission_percent, 0), true)
  ON CONFLICT (tenant_id, driver_id) DO UPDATE
    SET is_active = true,
        commission_percent = COALESCE(EXCLUDED.commission_percent, public.tribe_members.commission_percent),
        updated_at = now()
  RETURNING id INTO _member_id;

  -- Auditoria
  INSERT INTO public.audit_logs (tenant_id, user_id, action, entity_type, entity_id, payload)
  VALUES (
    _tenant_id, _user_id, 'tribe_member_joined', 'tribe_member', _member_id,
    jsonb_build_object('signup_slug', _signup_slug, 'commission_percent', _commission_percent)
  );

  RETURN _member_id;
END;
$$;