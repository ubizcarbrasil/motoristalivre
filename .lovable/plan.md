
# Fase 1 — Diagnóstico (sem código ainda)

Conforme o PDF, esta fase é só leitura + diagnóstico. Não vou escrever migration nem UI até sua aprovação.

## 1. Minha interpretação da regra (em uma frase)

Cada profissional tem **1 link público** (`/p/:slug`) que agrega **N tribos**, onde cada tribo é especializada em **1 serviço**. Ele é prestador na tribo principal (criada automaticamente no cadastro) e pode criar tribos secundárias como gestor de leads. Outros profissionais entram via `signup_slug` da tribo, podem estar em N tribos do mesmo serviço (de donos diferentes), e a comissão só é gerada quando o lead chega pelo link público do **dono da tribo** — nunca pelo link próprio do prestador. Vínculos são independentes e desvinculáveis (soft delete), com snapshot de `%` no momento do "won".

## 2. O que já existe no projeto

### Tabelas relevantes encontradas

| Conceito do PDF | Tabela existente | Observações |
|---|---|---|
| `professionals` | `drivers` (id = auth.users.id) | já tem `slug`, `handle`, `professional_type ∈ {driver, service_provider, both}`, `service_categories text[]`, `tenant_id NOT NULL` |
| `services` | `service_categories` (7 fixas: estetica, beleza, saude, tecnico, automotivo, pet, outros) + `service_types` (catálogo por driver, com preço/duração) | Categoria global ≠ serviço executado. PDF usa "serviço" no sentido de **categoria** |
| `tribes` | `tenants` (com `active_modules`, `slug`, `owner_user_id`) | Hoje cada tenant é uma "tribo" multi-módulo; **não tem service_id nem signup_slug**, e **não há UNIQUE(owner, service)** |
| `tribe_members` | parcialmente `drivers.tenant_id` (1:1 forte) + `professional_team_members` (owner_driver↔member_driver, sem `tribe_id` nem `commission_percent`) | **Conflito direto**: hoje um profissional só pertence a UM tenant. PDF exige N. |
| `leads` | não existe (há `orcamentos` para wizard de cotação, mas escopo diferente) | Precisa criar |
| `commission_ledger` | `commissions` (ride/booking-based, contexts: transbordo, affiliate, service_coverage, referral, servico, recrutamento) + `commission_rules` (% por tenant+categoria) | Estrutura existe, mas atrelada a ride/booking, não a lead. Falta `tribe_id`, `% snapshot` por membro. |
| Agenda | `professional_availability` + `provider_time_off` | Já é por driver; "espelhamento" hoje seria implícito (tribo expõe agenda do driver) |

### Rotas/UI existentes que se sobrepõem
- `/s/cadastro/profissional` — cadastro do profissional (cria tenant + driver). **Já cria a "tribo principal"** (tenant) automaticamente, mas sem o conceito `is_owner_provider` nem `service_id` da tribo.
- `/s/cadastrar/:categoria` — hub de cadastro com pré-seleção de categoria (já implementado).
- `/s/:slug` — vitrine pública do tenant (ainda não é `/p/:slug` por profissional).
- `/painel?aba=tribo` — gerenciamento da tribo (membros, regras, comissões).
- Convites: `driver_group_invites` (request/invite entre driver e tenant).

## 3. Conflitos críticos com o schema do PDF

```text
Conflito #1 — Tenant vs Tribe
  Hoje:  drivers.tenant_id NOT NULL  →  1 driver pertence a 1 tenant
  PDF:   tribe_members  →  1 profissional em N tribos do MESMO serviço

Conflito #2 — Granularidade do "serviço"
  PDF supõe service_categories = "atividade única da tribo" (ok com as 7 fixas).
  Mas service_types (catálogo por driver) tem outro papel (preço/duração).
  Decisão: tribe.service_id aponta para service_categories.id.

Conflito #3 — Tribo principal automática
  Cadastro atual cria tenant automaticamente, mas sem service_id nem
  flag is_owner_provider. Será preciso popular esses campos para tenants já
  existentes (backfill) OU mudar o cadastro para criar uma linha em tribes
  desacoplada do tenant.

Conflito #4 — Múltipla pertença
  Para suportar "B membro de A + criando própria tribo", drivers.tenant_id
  deixa de ser fonte da verdade da pertença. Propostas:
    (a) Manter drivers.tenant_id como "tribo de origem" e criar
        tribe_members para todos os vínculos extras.
    (b) Tornar drivers.tenant_id nullable e mover toda pertença para
        tribe_members.
  Recomendo (a) — minimiza ruptura do mobility/services existente.

Conflito #5 — commissions vs commission_ledger
  commissions é ride/booking-based. Lead-based é novo escopo. Opções:
    (a) Adicionar lead_id e tribe_id em commissions (reuso).
    (b) Criar commission_ledger separado só para o fluxo tribo+lead.
  Recomendo (b) — escopo isolado, evita confundir RLS/relatórios atuais.

Conflito #6 — public_slug do profissional
  Hoje o link público é por TENANT (/s/:slug) ou por driver dentro do tenant
  (/s/:slug/:driver_slug). PDF quer /p/:slug global por profissional.
  Decisão: usar drivers.handle (já único, já validado regex) como public_slug
  e adicionar rota /p/:handle.
```

## 4. Schema final proposto (mapeado ao existente)

```text
REUTILIZAR
  drivers              → papel de "professionals"
                         add: primary_service_category_id (uuid, fk service_categories)
  service_categories   → papel de "services" (sem mudanças)

NOVAS TABELAS
  tribes
    id, owner_driver_id (fk drivers), service_category_id (fk service_categories),
    tenant_id (fk tenants — herda do owner, p/ RLS),
    signup_slug (unique), is_owner_provider (bool), is_visible_public (bool),
    created_at, updated_at
    UNIQUE(owner_driver_id, service_category_id)

  tribe_members
    id, tribe_id (fk), driver_id (fk drivers),
    commission_percent (numeric 5,2),
    joined_via (enum: signup_link|manual_invite|auto_owner),
    is_active (bool), joined_at, left_at
    UNIQUE(tribe_id, driver_id)

  leads
    id, source_link_owner_driver_id (fk), tribe_id (fk),
    selected_provider_driver_id (fk),
    client_name, client_phone, status (new|contacted|won|lost),
    amount, created_at

  commission_ledger
    id, lead_id, beneficiary_driver_id, payer_driver_id,
    base_amount, percent (snapshot), amount,
    status (pending|paid|cancelled), created_at

TRIGGERS / FUNCTIONS
  fn_create_primary_tribe_after_driver_insert()  — auto-cria tribo principal
  fn_update_tribe_visibility()                   — recalcula is_visible_public
  fn_generate_commission_on_lead_won()           — snapshot de %
  fn_leave_tribe(tribe_id)                       — soft delete + bloqueia owner

BACKFILL
  Para drivers existentes com professional_type ∈ {service_provider, both}
  e primary_service_category_id definível, criar tribo principal +
  tribe_member auto_owner.

RLS
  tribes:           SELECT pública só onde is_visible_public=true; UPDATE só owner.
  tribe_members:    SELECT owner OU próprio member; INSERT via edge function
                    que valida signup_slug.
  leads:            SELECT source_link_owner OU selected_provider.
  commission_ledger: SELECT só beneficiary OU root_admin.
```

## 5. Telas/componentes afetados (mapeamento concreto)

| Tela do PDF | Onde implementar no projeto atual |
|---|---|
| `/cadastro` | já existe `/s/cadastrar` + `/s/cadastro/profissional` — adicionar campo `primary_service_category` e disparar criação da tribo principal |
| `/cadastro-tribo/:slug` | nova rota `/s/cadastro/tribo/:signup_slug` (resolve tribe → cadastro pré-vinculado) |
| `/dashboard/tribos` | nova aba no `/painel` ("Minhas Tribos") com lista + signup_link de cada |
| `/dashboard/tribos-onde-sou-membro` | nova aba no `/painel` ("Tribos onde sou membro") + botão Sair |
| `/dashboard/tribos/nova` | modal/sheet dentro da aba "Minhas Tribos" |
| `/dashboard/tribos/:id/membros` | drill-down dentro de "Minhas Tribos" |
| `/p/:slug` | nova rota — agrega tribos visíveis do driver (NÃO usar `/s/:slug` que é por tenant) |
| `/dashboard/leads` + `/dashboard/comissoes` | abas no `/painel` (fase 4) |

## 6. Pontos que preciso confirmar antes de escrever migration

1. **Tenants ficam ou somem?**
   O modelo atual gira em torno de `tenants`. As tribos novas são paralelas (e cada tribo herda `tenant_id` do owner) ou queremos unificar? **Minha recomendação: paralelas** — `tenants` continua sendo a entidade de billing/módulos, e `tribes` é a nova entidade de agrupamento por serviço.

2. **`/p/:slug` usa `drivers.handle` ou um novo `public_slug`?**
   Recomendo reusar `handle` (já único, já validado).

3. **Profissional sem serviço primário** (ex: gestor puro que nunca executa) — o PDF diz que cadastro força escolher um serviço principal. Confirma que **todo profissional obrigatoriamente tem 1 serviço principal**, mesmo se for só gestor de leads em outras tribos? Ou permitimos `primary_service_category_id NULL`?

4. **Backfill dos drivers existentes** — os profissionais já cadastrados com `professional_type='service_provider'` têm `service_categories text[]` (array). Pego o **primeiro** elemento como `primary` e crio tribo principal automaticamente? Ou marco para reconfigurar manualmente?

5. **`leads` x `orcamentos` existente** — já existe `/solicitar-orcamento`. Os "leads" do PDF são uma entidade nova distinta de orçamento (mais leves: nome+fone+status), ou queremos reaproveitar `orcamentos`? Recomendo **nova tabela `leads`** porque o ciclo é diferente (lead → won → comissão).

6. **Espelhamento de agenda** — `professional_availability` já é pública por driver. Não preciso replicar dados, só **agregar** na renderização do `/p/:slug`. Confirma?

## 7. Próximo passo

Aguardando suas respostas aos 6 pontos acima. Após aprovação, sigo para **Fase 2: migration única consolidada** (tabelas + RLS + triggers + indexes + backfill + `TRIBO_PROFISSIONAL_ARCHITECTURE.md`).
