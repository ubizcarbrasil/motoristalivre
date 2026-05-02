-- 1. Alterações em service_bookings
ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS is_coverage boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS briefing jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS origin_service_id uuid;

CREATE INDEX IF NOT EXISTS idx_service_bookings_origin_service
  ON public.service_bookings(origin_service_id)
  WHERE origin_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_bookings_is_coverage
  ON public.service_bookings(is_coverage)
  WHERE is_coverage = true;

-- 2. Tabela service_categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  icone text,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
  ON public.service_categories
  FOR SELECT
  USING (ativo = true OR public.is_root_admin(auth.uid()));

CREATE POLICY "Root admins manage categories"
  ON public.service_categories
  FOR ALL
  USING (public.is_root_admin(auth.uid()))
  WITH CHECK (public.is_root_admin(auth.uid()));

CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Tabela commission_rules
CREATE TABLE IF NOT EXISTS public.commission_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  comissao_cobertura_pct numeric NOT NULL DEFAULT 0,
  comissao_indicacao_pct numeric NOT NULL DEFAULT 0,
  comissao_fixa_brl numeric NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_commission_rules_tenant
  ON public.commission_rules(tenant_id);

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view rules"
  ON public.commission_rules
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins manage rules"
  ON public.commission_rules
  FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role])
  )
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role])
  );

CREATE POLICY "Root admins full access to rules"
  ON public.commission_rules
  FOR ALL
  USING (public.is_root_admin(auth.uid()))
  WITH CHECK (public.is_root_admin(auth.uid()));

CREATE TRIGGER update_commission_rules_updated_at
  BEFORE UPDATE ON public.commission_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Seed inicial de categorias
INSERT INTO public.service_categories (slug, nome, icone, descricao, ordem) VALUES
  ('estetica', 'Estética', 'sparkles', 'Tratamentos estéticos faciais e corporais', 10),
  ('beleza', 'Beleza', 'scissors', 'Cabelo, maquiagem, manicure e similares', 20),
  ('saude', 'Saúde', 'heart-pulse', 'Profissionais de saúde e bem-estar', 30),
  ('tecnico', 'Técnicos', 'wrench', 'Eletricistas, encanadores, técnicos em geral', 40),
  ('automotivo', 'Automotivo', 'car', 'Serviços para veículos', 50),
  ('pet', 'Pet', 'paw-print', 'Serviços para animais de estimação', 60),
  ('outros', 'Outros', 'more-horizontal', 'Demais categorias', 999)
ON CONFLICT (slug) DO NOTHING;