# Plano de Alinhamento — Memorial Tribo Serviços × Código Atual

Roadmap faseado em 7 fases (≈ 1 semana cada), ordenado por dependências técnicas e impacto no modelo de negócio. Cada fase entrega valor isolado e desbloqueia a próxima.

---

## Visão geral das dependências

```text
Fase 1 (Schema base)
   │
   ├──► Fase 2 (Comissão de serviços)  ─┐
   │                                     │
   ├──► Fase 3 (Briefing + cobertura)    ├──► Fase 5 (Rede pública /rede)
   │                                     │
   └──► Fase 4 (Categorias + regras)  ───┘
                                          │
                                          ├──► Fase 6 (@handle + roteamento)
                                          │
                                          └──► Fase 7 (Recrutamento recorrente)
```

---

## Fase 1 — Fundação de schema (Semana 1)

**Objetivo:** preparar tabelas e colunas que sustentam todas as fases seguintes. Sem isso, comissões e cobertura não funcionam.

**Entregáveis**
- Migration: adicionar `is_coverage boolean default false` em `service_bookings`
- Migration: adicionar `briefing jsonb default '{}'` em `service_bookings`
- Migration: adicionar `origin_service_id uuid` em `service_bookings` (rastreio de transbordo)
- Migration: criar tabela `service_categories` (id, slug, nome, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl, ativo)
- Migration: criar tabela `commission_rules` por categoria (substitui o % global apenas para serviços; mobilidade segue em `tenant_settings`)
- Seed inicial de categorias (estética, saúde, beleza, técnicos, etc.) com regras default
- Atualização de `src/integrations/supabase/types.ts` (automática)

**Riscos**: nenhum dado existente é destruído; colunas novas têm default seguro.

---

## Fase 2 — Motor de comissão de serviços (Semana 2) ✅ CONCLUÍDA

**Objetivo:** replicar para serviços a lógica financeira que hoje só existe em `rides`. Esta é a fase que destrava o modelo de receita.

**Entregue:**
- Coluna `category_id` em `service_types` (vincula serviço → categoria)
- Enum `commission_type` estendido com `service_coverage` e `service_referral`
- Enum `wallet_transaction_type` estendido com `commission_service_coverage` e `commission_service_referral`
- Função SQL `process_service_commission(_booking_id uuid)` com idempotência, leitura de `commission_rules` por categoria e fallback em `tenant_settings`
- Trigger `trg_process_service_commission` em `service_bookings` (dispara em `status = 'completed'`)
- Edge function `process-commission-services` (fallback manual/webhook)
- Lançamentos em `wallet_transactions` e `commissions` com `commission_context = 'servico'`
- Auditoria em `audit_logs` (`action = 'service_commission_processed'`)

**Depende de:** Fase 1.

---

## Fase 3 — Briefing estruturado e cobertura (Semana 3)

**Objetivo:** permitir que o cliente envie informações específicas por categoria e que profissionais cubram serviços uns dos outros.

**Entregáveis**
- Schema Zod por categoria em `src/features/triboservicos/schemas/schema_briefing.ts` (estética, saúde, técnico…)
- Componente dinâmico `formulario_briefing.tsx` que renderiza campos conforme `service_type.category`
- Persistência do briefing em `service_bookings.briefing` (jsonb)
- Fluxo de cobertura: ao agendar via link de associado, marcar `is_coverage = true` e `origin_service_id`
- Visualização do briefing no painel do profissional (aba agendamentos)

**Depende de:** Fase 1 (colunas `briefing`, `is_coverage`).

---

## Fase 4 — Categorias e regras configuráveis (Semana 4) ✅ CONCLUÍDA

**Entregue:**
- Tela admin `secao_regras_comissao.tsx` com CRUD completo de `commission_rules` por categoria
- Hook `useHookRegrasComissao` + service `servico_regras_comissao.ts`
- Editor `dialogo_editor_regra.tsx` suportando regra mista (% cobertura, % indicação, R$ fixo)
- Simulador `simulador_repasse.tsx` ("se um serviço de R$ X for cobertura/indicação, repasse será R$ Y")
- Sub-aba "Regras por categoria" no painel da tribo (modos `servicos` e `hibrido`)
- % global da `secao_comissoes` permanece como fallback quando não há regra de categoria
- Trigger `trg_audit_commission_rules` registrando insert/update/delete em `audit_logs`
- Índice único `(tenant_id, category_id)` evita regras duplicadas

**Depende de:** Fases 1 e 2 (motor já lê das regras).

---

## Fase 5 — Página pública /rede (Semana 5) ✅ CONCLUÍDA

**Entregue:**
- Rota `/s/:slug/:driver_slug/rede` com listagem da rede de associados
- Feature `src/features/rede_publica/`: page, hook, service, types e componentes próprios
- `pagina_rede_publica.tsx` com cabeçalho fixo, contador e estado vazio
- `filtros_rede_publica.tsx` com busca por nome, filtro por status (todos/disponíveis/ocupados/sem agenda) e por categoria
- `card_membro_rede.tsx` exibindo avatar, headline, status pulsante, badge de credencial e até 3 categorias com contador "+N"
- `lista_rede_publica.tsx` em grid responsivo (1 col mobile, 2 col ≥sm)
- SEO: title, meta description e canonical via `useSeoBasico` com nome do dono da rede
- Botão "Ver rede completa" em `secao_equipe_servicos` quando há ≥3 membros

**Pendente para fases futuras:** filtro de distância (depende de geolocalização) e OG image dinâmica.

**Depende de:** infraestrutura de equipe já existente (concluída em loops anteriores).

---

## Fase 6 — Handles @ e roteamento amigável (Semana 6) ✅

**Objetivo:** suporte a URLs no formato `/@joao-eletricista` conforme memorial.

**Entregáveis**
- ✅ Migration: coluna `handle` em `drivers` (unique global, regex `^[a-z0-9][a-z0-9_-]{2,29}$`), backfill automático
- ✅ Função SQL `generate_handle(_full_name)` com normalização (unaccent) + fallback numérico
- ✅ Função SQL `resolve_handle(_handle)` para resolver handle → driver/tenant
- ✅ Rota `/@:handle` (`PaginaResolverHandle`) que resolve e faz `Navigate replace`
- ✅ Componente `EditorHandleProfissional` no painel do profissional com validação em tempo real (debounce 400ms)
- ✅ Cards da rede pública (`CardMembroRede`) usam `@handle` quando disponível
- ✅ `MembroEquipe` agora carrega `handle`, propagado em 3 services

**Depende de:** Fases 1–5 (perfil já estável).

---

## Fase 7 — Recrutamento e recorrência (Semana 7) ✅

**Objetivo:** automatizar a comissão de 10% no cadastro + 5% mensal recorrente sobre profissionais recrutados.

**Entregáveis**
- ✅ Trigger `trg_recruitment_signup` em `subscriptions` (10% credita ao `referred_by`)
- ✅ Função `process_recruitment_monthly()` idempotente por `(referral_id, ano_mes)`
- ✅ Tabela `recruitment_monthly_payouts` com unique mensal e RLS por recrutador
- ✅ Edge function `cron-recruitment-commissions` agendada via `pg_cron` (03h diário)
- ✅ Feature `minha_rede`: KPIs (recrutados, MRR estimado, total acumulado, próxima recorrência) + lista de recrutados + histórico de repasses, plugada em `AbaCarteira`
- ✅ Auditoria em `audit_logs` (`action = 'recruitment_commission'`)

**Depende de:** Fases 1, 2 e 4 (infra de carteira e regras estáveis).

---

## Detalhamento técnico

**Tabelas novas**
- `service_categories` — catálogo central de categorias
- `commission_rules` — regras por categoria/tenant (cobertura, indicação, fixa)

**Tabelas alteradas**
- `service_bookings` — `is_coverage`, `briefing`, `origin_service_id`
- `drivers` — `handle` (Fase 6)

**Funções/triggers SQL**
- `process_service_commission` (Fase 2)
- `trg_process_service_commission` (Fase 2)
- `generate_handle` (Fase 6)

**Edge functions**
- `process-commission-services` (Fase 2)
- `cron-recruitment-commissions` (Fase 7)

**Enums estendidos**
- `commission_type`: + `service_coverage`, `service_referral`
- `commission_context`: + `servico`, `recrutamento`

**Frontend (features afetadas)**
- `src/features/admin/` — Fase 4 (regras de comissão)
- `src/features/triboservicos/` — Fases 3, 5, 6 (briefing, /rede, handles)
- `src/features/painel/` — Fases 3, 7 (visualização de briefing, minha rede)

---

## Critérios de pronto por fase

Cada fase só é considerada concluída quando:
1. Migration aplicada e RLS revisado
2. Testes manuais cobrindo o caminho feliz + 1 caso de erro
3. Auditoria (`audit_logs`) registrando as ações sensíveis
4. UI seguindo `design_system.md` (dark mode, IBM Plex, accent #1db865)
5. Código em PT-BR e arquitetura feature-based conforme regras do workspace

---

## Recomendação de arranque

Começar pela **Fase 1 + Fase 2 juntas** se o tempo permitir, porque Fase 1 sozinha não entrega valor visível — é apenas schema. A combinação Fase 1+2 já libera o motor financeiro de serviços, que é o gargalo do modelo.

Posso iniciar a Fase 1 (migrations + seed de categorias) no próximo loop assim que aprovar este plano.
