CREATE OR REPLACE FUNCTION public.fn_get_professional_profile_by_handle(_handle text)
RETURNS TABLE (
  driver_id uuid,
  driver_slug text,
  full_name text,
  avatar_url text,
  cover_url text,
  bio text,
  handle text,
  tenant_id uuid,
  tenant_slug text,
  tenant_name text,
  signup_slug text,
  active_modules text[],
  role text,
  category_id uuid,
  category_name text,
  category_slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH d AS (
    SELECT d.id, d.slug, d.handle, d.avatar_url, d.cover_url, d.bio,
           u.full_name
      FROM public.drivers d
      LEFT JOIN public.users u ON u.id = d.id
     WHERE lower(d.handle) = lower(_handle)
     LIMIT 1
  ),
  -- Tribos onde é dono
  donas AS (
    SELECT t.id AS tenant_id, t.slug AS tenant_slug, t.name AS tenant_name,
           t.signup_slug, t.active_modules, 'owner'::text AS role,
           t.service_category_id
      FROM public.tenants t
      JOIN d ON d.id IS NOT NULL
     WHERE t.owner_user_id = d.id
       AND COALESCE(t.is_visible_public, true) = true
  ),
  -- Tribos onde é membro ativo
  membros AS (
    SELECT t.id AS tenant_id, t.slug AS tenant_slug, t.name AS tenant_name,
           t.signup_slug, t.active_modules,
           COALESCE(tm.role, 'provider')::text AS role,
           t.service_category_id
      FROM public.tribe_members tm
      JOIN public.tenants t ON t.id = tm.tenant_id
      JOIN d ON d.id = tm.driver_id
     WHERE tm.is_active = true
       AND COALESCE(t.is_visible_public, true) = true
  ),
  todas AS (
    SELECT * FROM donas
    UNION
    SELECT * FROM membros
  )
  SELECT
    d.id, d.slug, d.full_name, d.avatar_url, d.cover_url, d.bio, d.handle,
    todas.tenant_id, todas.tenant_slug, todas.tenant_name, todas.signup_slug,
    todas.active_modules, todas.role,
    todas.service_category_id AS category_id,
    sc.nome AS category_name,
    sc.slug AS category_slug
    FROM d
    LEFT JOIN todas ON true
    LEFT JOIN public.service_categories sc ON sc.id = todas.service_category_id;
$$;

REVOKE ALL ON FUNCTION public.fn_get_professional_profile_by_handle(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_get_professional_profile_by_handle(text) TO anon, authenticated;