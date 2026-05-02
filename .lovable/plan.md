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

## Fase 2 — Motor de comissão de serviços (Semana 2)

**Objetivo:** replicar para serviços a lógica financeira que hoje só existe em `rides`. Esta é a fase que destrava o modelo de receita.

**Entregáveis**
- Função SQL `process_service_commission(_booking_id uuid)` espelhando `process_ride_commission`, mas lendo de `commission_rules` por categoria
- Trigger `trg_process_service_commission` em `service_bookings` (dispara quando `status` muda para `completed`)
- Edge function `process-commission-services` (fallback manual + webhook de pagamento)
- Estender `commission_type` enum com `service_coverage` e `service_referral`
- Lançamentos em `wallet_transactions` e `commissions` com `commission_context = 'servico'`
- Testes: booking com cobertura, booking com indicador, booking simples

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

## Fase 4 — Categorias e regras configuráveis (Semana 4)

**Objetivo:** dar ao admin controle sobre comissões por categoria, substituindo o controle único global atual.

**Entregáveis**
- Tela admin `pagina_regras_comissao.tsx` para CRUD de `commission_rules`
- Suporte a regra mista: `% sobre o valor` OU `R$ fixo por atendimento`
- Migração da `secao_comissoes` atual: % global vira fallback quando não há regra de categoria
- Painel de simulação ("se um serviço de R$ 200 for cobertura, repasse será R$ X")
- Auditoria de alterações em `audit_logs`

**Depende de:** Fases 1 e 2 (precisa que o motor leia das regras).

---

## Fase 5 — Página pública /rede (Semana 5)

**Objetivo:** entregar a vitrine pública da rede de associados, conforme memorial.

**Entregáveis**
- Rota `/s/:slug/:driver_slug/rede` com listagem completa de associados
- Componente `pagina_rede_publica.tsx` reutilizando `secao_equipe_servicos` em modo expandido
- Filtros: categoria, status (livre/ocupado), distância
- SEO: meta tags, OG image dinâmica
- Botão "ver rede completa" no perfil do profissional

**Depende de:** infraestrutura de equipe já existente (concluída em loops anteriores).

---

## Fase 6 — Handles @ e roteamento amigável (Semana 6)

**Objetivo:** suporte a URLs no formato `/@joao-eletricista` conforme memorial.

**Entregáveis**
- Migration: adicionar coluna `handle` em `drivers` (unique, lowercase, regex)
- Função SQL `generate_handle(_full_name)` com fallback numérico
- Rota catch-all `/@:handle` que resolve para o perfil correto (busca `drivers.handle`)
- Componente de edição de handle no painel do profissional (com validação de disponibilidade)
- Redirect 301 das URLs antigas (`/s/:slug/:driver_slug`) quando handle existir

**Depende de:** Fases 1–5 (perfil já estável).

---

## Fase 7 — Recrutamento e recorrência (Semana 7)

**Objetivo:** automatizar a comissão de 10% no cadastro + 5% mensal recorrente sobre profissionais recrutados.

**Entregáveis**
- Trigger em `subscriptions` (insert): credita 10% ao `referred_by` em `wallet_transactions`
- Edge function agendada (cron diário) que percorre `referrals.monthly_commission_active = true` e credita 5% da mensalidade ativa
- Tela "Minha rede" no painel do profissional com KPIs (recrutados, MRR gerado, próxima recorrência)
- Notificação ao recrutador a cada repasse
- Auditoria em `audit_logs` (`action = 'recruitment_commission'`)

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
