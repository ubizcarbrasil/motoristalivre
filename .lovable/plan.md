# Plano: Disponibilidade simples, em massa e obrigatória

Três frentes: (1) cadastrar horários em massa de forma fácil, (2) tornar isso obrigatório no onboarding solo do profissional, (3) permitir desligar disponibilidade ou bloquear datas/horários pontuais.

## 1. Editor de disponibilidade em massa (UX nova)

Substituir o `secao_minha_disponibilidade.tsx` atual (que pede um bloco por vez) por um editor estilo grade semanal com presets.

**Novo componente** `editor_disponibilidade_semanal.tsx`:
- Linha por dia da semana (Dom–Sáb) com toggle "Atende neste dia".
- Cada dia tem 1+ faixas (início → fim). Botão "+ adicionar faixa" para split (ex.: 9–12 e 14–18).
- Campo único global de duração de slot e buffer (aplicado a todos os blocos). Ninguém quer configurar slot por dia.
- **Presets rápidos** (chips no topo):
  - "Comercial seg–sex 9h–18h"
  - "Estendido seg–sáb 8h–20h"
  - "Final de semana sáb–dom 9h–17h"
  - "24/7"
  - "Copiar segunda para todos os dias úteis"
- Botão "Salvar" persiste tudo de uma vez (delete-then-insert por driver).

**Service novo** `salvarDisponibilidadeEmMassa(driverId, tenantId, blocos[])`:
- Apaga blocos atuais do driver e insere os novos em uma transação (via RPC `replace_provider_availability`).

## 2. Obrigatório no onboarding (fluxo solo profissional)

Adicionar uma sub-seção "Sua agenda" dentro de `etapa_configuracao.tsx`, exibida quando `temServicos` for true.

- Reusa `editor_disponibilidade_semanal.tsx` (modo "configuração inicial", sem persistir ainda — guarda no estado do hook).
- Pré-preenche com preset "Comercial seg–sex 9h–18h" para reduzir fricção.
- Validação na função `validar()` da etapa: pelo menos um dia ativo com faixa válida.
- Mensagem se vazio: "Defina ao menos um dia de atendimento para receber agendamentos."
- No `criarGrupo()` em `servico_onboarding.ts`, após criar tenant, inserir os blocos em `professional_availability`.

Tipos novos em `tipos_onboarding.ts`:
```ts
interface FaixaHorario { inicio: string; fim: string }
interface DiaDisponibilidade { diaSemana: 0..6; ativo: boolean; faixas: FaixaHorario[] }
DadosOnboarding.disponibilidade: { dias: DiaDisponibilidade[]; slotMin: number; bufferMin: number }
```

## 3. Pausar agenda + bloqueios pontuais

**Pausar tudo (kill switch)**: novo campo `accepting_bookings` (boolean default true) em `drivers`. Toggle no painel: "Aceitando agendamentos". Quando off:
- Vitrine pública mostra badge "Agenda pausada — não está aceitando agendamentos no momento".
- `book-service` retorna 423 com mensagem amigável.
- Não apaga blocos cadastrados.

**Bloqueios pontuais**: nova tabela `provider_time_off`:
```
id, driver_id, tenant_id, starts_at timestamptz, ends_at timestamptz,
reason text, all_day bool, created_at
```
RLS: driver gerencia próprio; público pode ler (para o cálculo de slots).

Componente `bloqueios_agenda.tsx` no painel:
- Lista bloqueios futuros com data/hora e motivo opcional.
- "Bloquear dia inteiro" e "Bloquear intervalo".
- Apagar bloqueio.

Integração:
- `calcular_slots_disponiveis.ts`: receber `bloqueios[]` e descartar slots que se sobreponham com qualquer bloqueio.
- `book-service` (edge): rejeitar (409 BLOCKED) se o `scheduled_at` cair em bloqueio ou se driver estiver com `accepting_bookings = false`.

## Arquivos afetados

```text
NOVOS
  src/features/painel/components/editor_disponibilidade_semanal.tsx
  src/features/painel/components/bloqueios_agenda.tsx
  src/features/onboarding/components/secao_disponibilidade_onboarding.tsx
  supabase/migrations/<timestamp>_disponibilidade_em_massa.sql

ALTERADOS
  src/features/painel/components/secao_minha_disponibilidade.tsx (substitui editor antigo)
  src/features/painel/components/aba_perfil.tsx (adiciona toggle "Aceitando agendamentos" + bloqueios)
  src/features/onboarding/components/etapa_configuracao.tsx (inclui agenda + validação)
  src/features/onboarding/services/servico_onboarding.ts (insere availability)
  src/features/onboarding/types/tipos_onboarding.ts (tipos de agenda)
  src/features/onboarding/hooks/hook_onboarding.ts (estado + preset default)
  src/features/passageiro/utils/calcular_slots_disponiveis.ts (considera bloqueios)
  src/features/passageiro/hooks/hook_dados_servico_motorista.ts (carrega bloqueios + flag accepting)
  src/features/servicos/services/servico_servicos.ts (RPC replace + CRUD bloqueios)
  src/features/servicos/types/tipos_servicos.ts
  supabase/functions/book-service/index.ts (valida bloqueios + accepting_bookings)
```

## Migração SQL (resumo)

- `ALTER TABLE drivers ADD COLUMN accepting_bookings boolean NOT NULL DEFAULT true;`
- `CREATE TABLE provider_time_off (...)` com RLS (owner CRUD, público SELECT).
- `CREATE FUNCTION replace_provider_availability(_driver_id uuid, _tenant_id uuid, _slot_min int, _buffer_min int, _blocos jsonb)` — apaga blocos do driver e insere os novos atomicamente, validando ownership via auth.uid().

## Pontos de atenção

- Manter retrocompatibilidade: blocos já cadastrados continuam válidos; o novo editor lê `professional_availability` e renderiza no modelo de faixas por dia.
- Preset default no onboarding já cria pelo menos um bloco — evita o problema atual em que o profissional finaliza sem horários.
- O fix de "serviço imediato sem disponibilidade" segue ativo como fallback, mas deixa de ser o caminho principal.
