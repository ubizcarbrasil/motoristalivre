-- Fase 6: handles @ amigáveis (correção: criar extensão antes)

-- 0. Extensão unaccent em schema dedicado
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- 1. Coluna handle
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS handle text;

ALTER TABLE public.drivers
  DROP CONSTRAINT IF EXISTS chk_drivers_handle_format;
ALTER TABLE public.drivers
  ADD CONSTRAINT chk_drivers_handle_format
  CHECK (handle IS NULL OR handle ~ '^[a-z0-9][a-z0-9_-]{2,29}$');

CREATE UNIQUE INDEX IF NOT EXISTS uq_drivers_handle
  ON public.drivers (handle)
  WHERE handle IS NOT NULL;

-- 2. Função para gerar handle
CREATE OR REPLACE FUNCTION public.generate_handle(_full_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  base_handle text;
  candidate text;
  suffix int := 0;
BEGIN
  base_handle := lower(extensions.unaccent(coalesce(_full_name, '')));
  base_handle := regexp_replace(base_handle, '[^a-z0-9]+', '-', 'g');
  base_handle := regexp_replace(base_handle, '^-+|-+$', '', 'g');

  IF length(base_handle) < 3 THEN
    base_handle := 'pro-' || substring(md5(random()::text) from 1 for 6);
  END IF;

  IF length(base_handle) > 30 THEN
    base_handle := substring(base_handle from 1 for 30);
    base_handle := regexp_replace(base_handle, '-+$', '', 'g');
  END IF;

  candidate := base_handle;

  WHILE EXISTS (SELECT 1 FROM public.drivers WHERE handle = candidate) LOOP
    suffix := suffix + 1;
    candidate := substring(base_handle from 1 for greatest(1, 30 - length(suffix::text) - 1)) || '-' || suffix::text;
    IF suffix > 9999 THEN
      candidate := base_handle || '-' || substring(md5(random()::text) from 1 for 6);
      EXIT;
    END IF;
  END LOOP;

  RETURN candidate;
END;
$$;

-- 3. Função para resolver handle
CREATE OR REPLACE FUNCTION public.resolve_handle(_handle text)
RETURNS TABLE(driver_id uuid, driver_slug text, tenant_slug text, tenant_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.id, d.slug, t.slug, t.id
  FROM public.drivers d
  JOIN public.tenants t ON t.id = d.tenant_id
  WHERE d.handle = lower(_handle)
  LIMIT 1;
$$;

-- 4. Backfill
DO $$
DECLARE
  rec RECORD;
  novo_handle text;
BEGIN
  FOR rec IN
    SELECT d.id, COALESCE(u.full_name, d.slug) AS nome
    FROM public.drivers d
    LEFT JOIN public.users u ON u.id = d.id
    WHERE d.handle IS NULL
  LOOP
    novo_handle := public.generate_handle(rec.nome);
    UPDATE public.drivers SET handle = novo_handle WHERE id = rec.id;
  END LOOP;
END $$;