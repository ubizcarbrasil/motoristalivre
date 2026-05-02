
-- Enums
CREATE TYPE public.quote_question_type AS ENUM ('single_select','multi_select','number_chips','date_chips','text_short','photo');
CREATE TYPE public.quote_template_scope AS ENUM ('category','service_type');
CREATE TYPE public.quote_request_status AS ENUM ('open','closed','expired','cancelled');
CREATE TYPE public.quote_offer_status AS ENUM ('pending','accepted','declined','withdrawn');
CREATE TYPE public.quote_dispatch_response AS ENUM ('pending','accepted','declined','expired');
CREATE TYPE public.quote_urgency AS ENUM ('agora','hoje','esta_semana','data_marcada');

-- Templates
CREATE TABLE public.service_quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NULL,
  scope public.quote_template_scope NOT NULL DEFAULT 'category',
  category_id uuid NULL,
  service_type_id uuid NULL,
  nome text NOT NULL,
  descricao text NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.service_quote_templates (category_id);
CREATE INDEX ON public.service_quote_templates (service_type_id);

CREATE TABLE public.service_quote_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.service_quote_templates(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  tipo public.quote_question_type NOT NULL,
  opcoes jsonb NULL,
  obrigatorio boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  condicional jsonb NULL,
  ajuda text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, key)
);
CREATE INDEX ON public.service_quote_questions (template_id, ordem);

-- Requests
CREATE TABLE public.service_quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  category_id uuid NOT NULL,
  service_type_id uuid NULL,
  template_id uuid NULL REFERENCES public.service_quote_templates(id) ON DELETE SET NULL,
  client_id uuid NULL,
  guest_passenger_id uuid NULL,
  contact_name text NULL,
  contact_whatsapp text NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  perguntas_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  endereco jsonb NULL,
  endereco_lat numeric NULL,
  endereco_lng numeric NULL,
  urgencia public.quote_urgency NOT NULL DEFAULT 'esta_semana',
  data_desejada timestamptz NULL,
  max_propostas smallint NOT NULL DEFAULT 4 CHECK (max_propostas IN (1,2,4)),
  fotos text[] NOT NULL DEFAULT '{}'::text[],
  observacao text NULL,
  status public.quote_request_status NOT NULL DEFAULT 'open',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  closed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (client_id IS NOT NULL OR guest_passenger_id IS NOT NULL)
);
CREATE INDEX ON public.service_quote_requests (tenant_id, status, created_at DESC);
CREATE INDEX ON public.service_quote_requests (category_id, status);
CREATE INDEX ON public.service_quote_requests (client_id);

-- Offers
CREATE TABLE public.service_quote_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_quote_requests(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  valor numeric NOT NULL CHECK (valor >= 0),
  prazo_dias_min smallint NULL,
  prazo_dias_max smallint NULL,
  data_disponivel timestamptz NULL,
  mensagem text NULL,
  status public.quote_offer_status NOT NULL DEFAULT 'pending',
  valid_until timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, driver_id)
);
CREATE INDEX ON public.service_quote_offers (request_id, status);
CREATE INDEX ON public.service_quote_offers (driver_id, status);

-- Dispatches
CREATE TABLE public.service_quote_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_quote_requests(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  dispatched_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz NULL,
  response public.quote_dispatch_response NOT NULL DEFAULT 'pending',
  UNIQUE (request_id, driver_id)
);
CREATE INDEX ON public.service_quote_dispatches (driver_id, response);

-- Triggers updated_at
CREATE TRIGGER trg_quote_templates_updated BEFORE UPDATE ON public.service_quote_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_quote_requests_updated BEFORE UPDATE ON public.service_quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_quote_offers_updated BEFORE UPDATE ON public.service_quote_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Haversine
CREATE OR REPLACE FUNCTION public._haversine_km(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT 6371 * 2 * asin(sqrt(
    power(sin(radians(($3 - $1)/2)),2) +
    cos(radians($1)) * cos(radians($3)) * power(sin(radians(($4 - $2)/2)),2)
  ))::numeric;
$$;

-- Enable RLS
ALTER TABLE public.service_quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_quote_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_quote_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_quote_dispatches ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "Public can view active templates" ON public.service_quote_templates
  FOR SELECT USING (ativo = true OR is_root_admin(auth.uid()));
CREATE POLICY "Root admins manage templates" ON public.service_quote_templates
  FOR ALL USING (is_root_admin(auth.uid())) WITH CHECK (is_root_admin(auth.uid()));
CREATE POLICY "Tenant admins manage own templates" ON public.service_quote_templates
  FOR ALL USING (tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]))
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));

-- Questions policies (mirror templates)
CREATE POLICY "Public can view questions" ON public.service_quote_questions
  FOR SELECT USING (true);
CREATE POLICY "Root admins manage questions" ON public.service_quote_questions
  FOR ALL USING (is_root_admin(auth.uid())) WITH CHECK (is_root_admin(auth.uid()));
CREATE POLICY "Tenant admins manage questions" ON public.service_quote_questions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.service_quote_templates t WHERE t.id = template_id AND t.tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.service_quote_templates t WHERE t.id = template_id AND t.tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role])));

-- Requests policies
CREATE POLICY "Client views own requests" ON public.service_quote_requests
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Public guest views own request" ON public.service_quote_requests
  FOR SELECT USING (guest_passenger_id IS NOT NULL);
CREATE POLICY "Tenant staff view requests" ON public.service_quote_requests
  FOR SELECT USING (tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));
CREATE POLICY "Driver views dispatched requests" ON public.service_quote_requests
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_quote_dispatches d WHERE d.request_id = service_quote_requests.id AND d.driver_id = auth.uid()));
CREATE POLICY "Client cancels own request" ON public.service_quote_requests
  FOR UPDATE USING (client_id = auth.uid() AND status = 'open') WITH CHECK (client_id = auth.uid() AND status IN ('open','cancelled','closed'));

-- Offers policies
CREATE POLICY "Driver views own offers" ON public.service_quote_offers
  FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Driver inserts own offer" ON public.service_quote_offers
  FOR INSERT WITH CHECK (driver_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.service_quote_dispatches d WHERE d.request_id = service_quote_offers.request_id AND d.driver_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.service_quote_requests r WHERE r.id = request_id AND r.status = 'open'));
CREATE POLICY "Driver updates own offer" ON public.service_quote_offers
  FOR UPDATE USING (driver_id = auth.uid()) WITH CHECK (driver_id = auth.uid());
CREATE POLICY "Client views offers of own request" ON public.service_quote_offers
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_quote_requests r WHERE r.id = request_id AND r.client_id = auth.uid()));
CREATE POLICY "Tenant admins view offers" ON public.service_quote_offers
  FOR SELECT USING (tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));

-- Dispatches policies
CREATE POLICY "Driver views own dispatches" ON public.service_quote_dispatches
  FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Driver updates own dispatch" ON public.service_quote_dispatches
  FOR UPDATE USING (driver_id = auth.uid()) WITH CHECK (driver_id = auth.uid());
CREATE POLICY "Client views dispatches of own request" ON public.service_quote_dispatches
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_quote_requests r WHERE r.id = request_id AND r.client_id = auth.uid()));
CREATE POLICY "Tenant staff view dispatches" ON public.service_quote_dispatches
  FOR SELECT USING (tenant_id = get_user_tenant_id(auth.uid()) AND get_user_role(auth.uid()) = ANY(ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_quote_dispatches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_quote_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_quote_requests;

-- ============ SEED de templates globais ============
-- Pet
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar serviço Pet', 'Formulário padrão para pet'
  FROM public.service_categories WHERE slug = 'pet'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'tipo_servico','Qual serviço você precisa?','single_select',true,1,
  '[{"valor":"banho_tosa","rotulo":"Banho e tosa"},{"valor":"dog_walker","rotulo":"Dog walker"},{"valor":"pet_sitter","rotulo":"Pet sitter"},{"valor":"vet_domicilio","rotulo":"Veterinário em domicílio"}]'::jsonb),
((SELECT id FROM t),'porte','Porte do pet','single_select',true,2,
  '[{"valor":"pequeno","rotulo":"Pequeno"},{"valor":"medio","rotulo":"Médio"},{"valor":"grande","rotulo":"Grande"},{"valor":"gigante","rotulo":"Gigante"}]'::jsonb),
((SELECT id FROM t),'quantidade','Quantos pets?','number_chips',true,3,
  '[{"valor":"1","rotulo":"1"},{"valor":"2","rotulo":"2"},{"valor":"3","rotulo":"3"},{"valor":"4","rotulo":"4+"}]'::jsonb),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,4,
  '[{"valor":"agora","rotulo":"Agora"},{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,5,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);

-- Beleza
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar Beleza em domicílio', 'Formulário padrão de beleza'
  FROM public.service_categories WHERE slug = 'beleza'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'tipo_servico','Qual serviço?','single_select',true,1,
  '[{"valor":"manicure","rotulo":"Manicure"},{"valor":"cabeleireiro","rotulo":"Cabeleireiro"},{"valor":"maquiagem","rotulo":"Maquiagem"},{"valor":"sobrancelha","rotulo":"Design de sobrancelha"}]'::jsonb),
((SELECT id FROM t),'ocasiao','Ocasião','single_select',false,2,
  '[{"valor":"dia_dia","rotulo":"Dia a dia"},{"valor":"festa","rotulo":"Festa"},{"valor":"casamento","rotulo":"Casamento"},{"valor":"outra","rotulo":"Outra"}]'::jsonb),
((SELECT id FROM t),'pessoas','Quantas pessoas?','number_chips',true,3,
  '[{"valor":"1","rotulo":"1"},{"valor":"2","rotulo":"2"},{"valor":"3","rotulo":"3"},{"valor":"4","rotulo":"4+"}]'::jsonb),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,4,
  '[{"valor":"agora","rotulo":"Agora"},{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,5,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);

-- Estética
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar Estética', 'Formulário padrão de estética'
  FROM public.service_categories WHERE slug = 'estetica'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'tipo_servico','Qual serviço?','single_select',true,1,
  '[{"valor":"limpeza_pele","rotulo":"Limpeza de pele"},{"valor":"massagem","rotulo":"Massagem"},{"valor":"depilacao","rotulo":"Depilação"},{"valor":"outro","rotulo":"Outro"}]'::jsonb),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,2,
  '[{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,3,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);

-- Técnico (reparos/AC etc)
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar Serviço Técnico', 'Reparos e instalações'
  FROM public.service_categories WHERE slug = 'tecnico'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'tipo_servico','Qual serviço?','single_select',true,1,
  '[{"valor":"eletricista","rotulo":"Eletricista"},{"valor":"encanador","rotulo":"Encanador"},{"valor":"marido_aluguel","rotulo":"Marido de aluguel"},{"valor":"montador","rotulo":"Montador de móveis"},{"valor":"ar_condicionado","rotulo":"Ar-condicionado"},{"valor":"chaveiro","rotulo":"Chaveiro"}]'::jsonb),
((SELECT id FROM t),'tipo_imovel','Tipo de imóvel','single_select',true,2,
  '[{"valor":"apartamento","rotulo":"Apartamento"},{"valor":"casa","rotulo":"Casa"},{"valor":"comercial","rotulo":"Comercial"}]'::jsonb),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,3,
  '[{"valor":"agora","rotulo":"Emergência"},{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,4,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);

-- Automotivo
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar serviço Automotivo', NULL
  FROM public.service_categories WHERE slug = 'automotivo'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'tipo_servico','Qual serviço?','single_select',true,1,
  '[{"valor":"lavagem","rotulo":"Lavagem"},{"valor":"polimento","rotulo":"Polimento"},{"valor":"mecanica","rotulo":"Mecânica"},{"valor":"socorro","rotulo":"Socorro/guincho"}]'::jsonb),
((SELECT id FROM t),'porte','Porte do veículo','single_select',true,2,
  '[{"valor":"hatch","rotulo":"Hatch"},{"valor":"sedan","rotulo":"Sedan"},{"valor":"suv","rotulo":"SUV"},{"valor":"caminhonete","rotulo":"Caminhonete"}]'::jsonb),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,3,
  '[{"valor":"agora","rotulo":"Agora"},{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,4,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);

-- Saúde
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar Saúde em domicílio', NULL
  FROM public.service_categories WHERE slug = 'saude'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'tipo_servico','Qual atendimento?','single_select',true,1,
  '[{"valor":"enfermagem","rotulo":"Enfermagem"},{"valor":"fisio","rotulo":"Fisioterapia"},{"valor":"cuidador","rotulo":"Cuidador"},{"valor":"nutricao","rotulo":"Nutrição"}]'::jsonb),
((SELECT id FROM t),'frequencia','Frequência','single_select',true,2,
  '[{"valor":"unica","rotulo":"Única vez"},{"valor":"semanal","rotulo":"Semanal"},{"valor":"diaria","rotulo":"Diária"}]'::jsonb),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,3,
  '[{"valor":"agora","rotulo":"Agora"},{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,4,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);

-- Outros (genérico)
WITH t AS (
  INSERT INTO public.service_quote_templates (scope, category_id, nome, descricao)
  SELECT 'category', id, 'Solicitar Orçamento', 'Formulário genérico'
  FROM public.service_categories WHERE slug = 'outros'
  RETURNING id
)
INSERT INTO public.service_quote_questions (template_id, key, label, tipo, obrigatorio, ordem, opcoes) VALUES
((SELECT id FROM t),'descricao_servico','O que você precisa?','text_short',true,1,NULL),
((SELECT id FROM t),'urgencia','Quando precisa?','single_select',true,2,
  '[{"valor":"agora","rotulo":"Agora"},{"valor":"hoje","rotulo":"Hoje"},{"valor":"esta_semana","rotulo":"Esta semana"},{"valor":"data_marcada","rotulo":"Escolher data"}]'::jsonb),
((SELECT id FROM t),'max_propostas','Quantos profissionais quer receber?','single_select',true,3,
  '[{"valor":"1","rotulo":"Até 1"},{"valor":"2","rotulo":"Até 2"},{"valor":"4","rotulo":"Até 4"}]'::jsonb);
