-- Corrige tribos cujo dono é prestador de serviços para refletirem só o módulo services
-- e garante que profissionais legados não fiquem misturando UI de mobilidade.

-- 1. Tribo "Maria brasil" usada como profissional autônomo: ajusta para serviços
update public.tenants
set active_modules = array['services']::text[],
    updated_at = now()
where slug = 'mariabrasil'
  and (active_modules @> array['mobility']::text[]);

-- 2. Driver dono dessa tribo, se ainda estiver como driver mas tem categorias de serviço,
--    vira service_provider.
update public.drivers d
set professional_type = 'service_provider',
    updated_at = now()
from public.tenants t
where t.id = d.tenant_id
  and t.slug = 'mariabrasil'
  and d.id = t.owner_user_id
  and d.professional_type = 'driver'
  and array_length(d.service_categories, 1) is not null
  and array_length(d.service_categories, 1) > 0;

-- 3. Reforço genérico: qualquer tribo cujo dono é service_provider e ainda tem mobility
--    perde mobility para parar de vazar UI de corridas.
update public.tenants t
set active_modules = array['services']::text[],
    updated_at = now()
from public.drivers d
where d.id = t.owner_user_id
  and d.professional_type = 'service_provider'
  and t.active_modules @> array['mobility']::text[];