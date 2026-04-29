## Plano: Módulo Serviços (TriboServ)

Extensão da plataforma Tribo para profissionais liberais (agendamentos), reutilizando handles, carteira, afiliados, comissões, CRM, auth, multi-tenant e RLS já existentes. Nada do módulo Mobilidade (TriboCar) será alterado.

### Ajustes necessários na spec original

Antes de executar, alguns pontos da spec não casam com o schema atual e serão corrigidos no plano:

1. **Funções RLS**: a spec usa `get_current_tenant_id()` e `is_root_admin()` sem args. As reais são `get_user_tenant_id(auth.uid())` e `is_root_admin(auth.uid())`. Vou usar essas.
2. **`drivers.user_id` não existe** — `drivers.id` já é o `auth.uid()` do motorista. Os subselects das policies serão ajustados (`driver_id = auth.uid()` em vez de `WHERE user_id = auth.uid()`).
3. **`notifications`** não existe no projeto. A edge `book-service` usará o padrão atual de realtime (INSERT em `service_bookings` já dispara via Supabase Realtime se habilitado na publication; o painel se inscreve no canal). Sem tabela nova.
4. **Cliente guest**: `service_bookings.client_id` referencia `passengers(id)` que requer auth. Para suportar agendamentos de cliente sem login (igual ao fluxo guest do passageiro), adiciono também `guest_passenger_id uuid REFERENCES guest_passengers(id)`. A edge function aceita um dos dois.
5. **Onboarding hoje tem 5 etapas (0–4)**. Inserir nova etapa "Módulos" entre Identidade(0) e Plano(1), expandindo para 6 etapas (0–5) e atualizando `IndicadorProgresso`, `useOnboarding` e a página.

### PASSO 1 — Migration única

Ordem: enums/colunas em tabelas existentes → tabelas novas → indexes → RLS.

**Alterações em tabelas existentes**
- `tenants.active_modules text[] DEFAULT ARRAY['mobility']`
- `drivers`: `professional_type text DEFAULT 'driver' CHECK IN ('driver','service_provider','both')`, `service_categories text[] DEFAULT '{}'`, `credential_verified boolean DEFAULT false`, `credential_type text`, `credential_number text`
- `reviews.module text DEFAULT 'mobility' CHECK IN ('mobility','services')`
- `wallet_transactions.module text DEFAULT 'mobility' CHECK IN ('mobility','services')`
- `commissions.commission_context text DEFAULT 'transbordo' CHECK IN ('transbordo','affiliate','service_coverage','referral')`

**Novas tabelas** (todas com RLS)
- `service_types` — catálogo de serviços por profissional. Policies: SELECT público (perfil público lista); INSERT/UPDATE/DELETE pelo dono (`driver_id = auth.uid()`); ALL para tenant_admin do tenant.
- `professional_availability` — blocos semanais. SELECT público; mutações pelo dono.
- `service_bookings` — agendamentos. Inclui `client_id` e `guest_passenger_id` (um dos dois). Policies: SELECT pelo motorista, pelo cliente (auth) ou via guest (igual ao padrão de `ride_requests`); INSERT via edge com service role (sem policy de INSERT pelo cliente — apenas edge function); UPDATE pelo motorista para status, pelo cliente para cancelar pendente.
- `service_reminders` — lembretes de retorno. SELECT/UPDATE pelo motorista dono.
- `professional_credentials` — registros profissionais (CRM/OAB/etc.). SELECT pelo dono e root; INSERT pelo dono; verificação só por root_admin/tenant_admin.

**Indexes** conforme spec.

### PASSO 2 — Edge function `book-service`

Arquivo: `supabase/functions/book-service/index.ts`. CORS, validação Zod, usa `SUPABASE_SERVICE_ROLE_KEY`.

Recebe: `tenant_id`, `driver_id`, `service_type_id`, `scheduled_at`, `payment_method`, `notes`, `origin_driver_id?`, `origin_affiliate_id?`, e exatamente um de `client_id` (auth) ou `{full_name, whatsapp}` (guest).

Fluxo:
1. Carrega `service_type` e valida `is_active=true` e que pertence ao `driver_id`.
2. Calcula `dow = extract(dow from scheduled_at)`, busca `professional_availability` ativa do dia e confirma que `scheduled_at..scheduled_at+duration` cabe num bloco.
3. Verifica conflito: nenhum `service_bookings` em status `confirmed|in_progress` para o mesmo `driver_id` que se sobreponha ao intervalo `[scheduled_at, scheduled_at+duration+buffer)`.
4. Em RPC transacional (ou sequência atômica via `supabase.rpc`): se guest, cria `guest_passengers`; INSERT `service_bookings` com `status='confirmed'`.
5. Se vier `return_reminder_date`, INSERT `service_reminders`.
6. Retorna o booking. Conflito → 409 com mensagem.

Notificação ao profissional: realtime via INSERT em `service_bookings` (publication `supabase_realtime`).

### PASSO 3 — Onboarding: etapa Módulos

- Novo tipo `EtapaOnboarding` 0..5 e novo array `MODULOS_DISPONIVEIS`.
- Novo componente `etapa_modulos.tsx` com 2 cards (Mobilidade / Serviços), multi-seleção. Se ambos: badge "Plataforma completa — 25% de desconto".
- `useOnboarding`: adicionar `modulosSelecionados: string[]` (default `['mobility']`).
- `pagina_onboarding.tsx`: render condicional para etapa 1 = Módulos, depois Plano(2), Pagamento(3), Configuração(4), Convites(5).
- `IndicadorProgresso`: 6 passos.
- `servico_onboarding.criarGrupo`: gravar `active_modules` no tenant via UPDATE após `create_tenant_with_owner`.

### PASSO 4 — Painel do profissional

Hook novo `hook_perfil_servico.ts` que retorna `{ professionalType, services, availability, bookingsHoje }` filtrado pelo `driver_id` do usuário logado e tribo ativa.

- **Aba Início** (`aba_inicio.tsx`): se `professionalType` inclui `service_provider`, renderiza novo `secao_agenda_hoje.tsx` acima de `GridStats`. Lista `service_bookings` do dia (ordem por `scheduled_at`) com horário, cliente (anonimizado se `pending`), serviço, valor e badge de status. Sem mexer em mobilidade.
- **Aba Configurações** (`aba_configuracoes.tsx`): se `service_provider`, novas seções:
  - `secao_meus_servicos.tsx`: lista `service_types`, toggle `is_active`, modal "Adicionar serviço" (nome, descrição, duração, preço, `is_immediate`).
  - `secao_minha_disponibilidade.tsx`: grade semanal (Dom–Sáb), blocos de horário com botão "Adicionar bloco" (start, end, slot, buffer).
- Service `servico_servicos.ts` em `src/features/servicos/services/` com CRUD de `service_types` e `professional_availability`.

### PASSO 5 — Perfil público (`/:slug/perfil/:driver_slug`)

Em `pagina_perfil_motorista.tsx`, se `driver.professional_type` inclui `service_provider`:
- Badge "Verificado" ao lado do nome se `credential_verified=true` (tooltip com tipo + número).
- Nova seção "Serviços disponíveis" listando `service_types` ativos (nome, duração formatada, preço, botão "Agendar" que leva ao link `/{slug}/{driver_slug}` com query `?modo=agendar&servico={id}`).
- Nova seção "Disponibilidade" — grade visual dos blocos da semana.

### PASSO 6 — Tela do cliente para agendamento

Novo componente `src/features/passageiro/components/agendamento_servico.tsx` (snake_case por convenção do projeto, apesar da spec usar PascalCase).

Em `pagina_passageiro.tsx`: depois de carregar dados do driver/tenant do link, ramificar:
- Se `driver.professional_type` inclui `service_provider` → renderiza `AgendamentoServico` em vez do fluxo de corrida.
- Caso contrário → fluxo atual de corrida (intacto).

`AgendamentoServico` mostra:
1. Header com foto, nome, @handle, nota e badge verificado.
2. Lista de `service_types` ativos para selecionar.
3. Grade dos próximos 14 dias com slots calculados a partir de `professional_availability` menos `service_bookings` confirmados.
4. Slot selecionado + observações + método de pagamento (Dinheiro/PIX/Cartão/Saldo).
5. Botão "Confirmar agendamento" → invoca `book-service` (com fluxo guest se sem login, reusando `dialogo_dados_passageiro`).
6. Tela de sucesso com botão "Adicionar ao calendário" (gera `.ics` client-side via blob).

### Arquivos novos / editados

**Novos**
- `supabase/migrations/<timestamp>_modulo_servicos.sql`
- `supabase/functions/book-service/index.ts`
- `src/features/onboarding/components/etapa_modulos.tsx`
- `src/features/servicos/types/tipos_servicos.ts`
- `src/features/servicos/services/servico_servicos.ts`
- `src/features/servicos/hooks/hook_perfil_servico.ts`
- `src/features/painel/components/secao_agenda_hoje.tsx`
- `src/features/painel/components/secao_meus_servicos.tsx`
- `src/features/painel/components/secao_minha_disponibilidade.tsx`
- `src/features/passageiro/components/agendamento_servico.tsx`
- `src/features/passageiro/utils/gerador_ics.ts`

**Editados (apenas adições, sem quebrar mobilidade)**
- `src/features/onboarding/hooks/hook_onboarding.ts` — adiciona `modulosSelecionados` e expande etapas.
- `src/features/onboarding/components/indicador_progresso.tsx` — 6 passos.
- `src/features/onboarding/pages/pagina_onboarding.tsx` — nova etapa.
- `src/features/onboarding/services/servico_onboarding.ts` — grava `active_modules`.
- `src/features/onboarding/types/tipos_onboarding.ts` — `EtapaOnboarding 0..5`, novo campo.
- `src/features/onboarding/constants/constantes_onboarding.ts` — `MODULOS_DISPONIVEIS`.
- `src/features/painel/components/aba_inicio.tsx` — render condicional `Agenda de hoje`.
- `src/features/painel/components/aba_configuracoes.tsx` — render condicional seções de serviço.
- `src/features/motorista/pages/pagina_perfil_motorista.tsx` — seções públicas Serviços/Disponibilidade/Verificado.
- `src/features/motorista/hooks/hook_perfil_motorista.ts` — incluir `professional_type`, `credential_verified`, services e availability.
- `src/features/passageiro/pages/pagina_passageiro.tsx` — bifurcação serviço x corrida.
- `src/features/painel/types/tipos_painel.ts` — incluir `professional_type` no perfil.

### O que NÃO será alterado

- `dispatch-ride`, `notify_dispatch_ride`, trigger, `card_dispatch.tsx`, `hook_solicitacao.ts`, `overlay_busca_mapa.tsx`, fluxo de corrida.
- Rotas existentes; só ramificação interna em `pagina_passageiro` e `pagina_perfil_motorista`.
- RLS e triggers do módulo Mobilidade.

### Como testar
1. Criar grupo no `/onboarding` selecionando "Serviços" → ver `tenants.active_modules` com `services`.
2. Como motorista, em `/painel?aba=configuracoes` ativar `professional_type='service_provider'` (via SQL ou seção a adicionar), criar 1 serviço e 1 bloco de disponibilidade.
3. Acessar `/{slug}/{driver_slug}` em aba anônima → ver tela `AgendamentoServico`.
4. Agendar um horário → conferir `service_bookings`; reagendar mesmo horário → 409.
5. No `/painel` do profissional, ver "Agenda de hoje" populada.
6. Acessar `/{slug}/perfil/{driver_slug}` → ver seções Serviços, Disponibilidade e badge Verificado quando aplicável.
7. Confirmar que o fluxo de corrida normal (driver com `professional_type='driver'`) segue idêntico.
