-- Ajusta active_modules das tribos cujo dono é service_provider para refletir
-- corretamente o modo de serviços e não vazar UI de mobilidade.
update public.tenants t
set active_modules = array['services']::text[]
from public.drivers d
where d.id = t.owner_user_id
  and d.professional_type = 'service_provider'
  and (
    not (t.active_modules @> array['services']::text[])
    or t.active_modules @> array['mobility']::text[]
  );
