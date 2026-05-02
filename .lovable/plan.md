# Plano — Endereço do atendimento + cálculo dinâmico do valor

## Objetivo
Permitir que o cliente, no momento de agendar um serviço, informe:
1. **Endereço** onde o serviço será prestado (com possibilidade do profissional cobrar deslocamento).
2. **Fatores variáveis** (tamanho, quantidade, horas/dias) que ajustam o **preço final** conforme o tipo de serviço.

Hoje a tela de agendamento mostra apenas slot, dados do cliente, observações e pagamento (ver imagem enviada). Não existe campo de endereço nem cálculo dinâmico — o preço é sempre o `service_types.price` fixo.

---

## 1. Modelagem de preço por serviço (profissional configura)

A tabela `service_types` já tem `pricing_mode` (`fixed | hourly | daily`) e `price`. Vamos expandir para um modelo flexível por **fator de cobrança**:

Nova tabela `service_pricing_factors`:
- `id`, `service_type_id`, `tenant_id`
- `key` (ex.: `metros_quadrados`, `quantidade_comodos`, `horas`, `dias`, `quantidade_pets`)
- `label` (ex.: "Quantos metros quadrados?")
- `input_type` (`number` | `select`)
- `options` (jsonb — para select: `[{valor, rotulo, multiplicador}]`)
- `unit_price` (numérico — preço por unidade)
- `min_value`, `max_value`, `step`, `default_value`
- `required` (bool)
- `ordem`

Fórmula final:
```
total = preco_base
      + soma(unit_price * valor_informado) por fator numérico
      + soma(multiplicador) por fator select
      + taxa_deslocamento (se aplicável)
```

Mantemos `price` como **preço base / mínimo** e `pricing_mode` como dica visual.

## 2. Endereço de atendimento

Nova tabela `service_booking_addresses` (1:1 com `service_bookings`):
- `booking_id`, `tenant_id`
- `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf`
- `latitude`, `longitude` (opcional, preenchido por geocoding)
- `referencia` (texto livre)

Configuração no `service_types`:
- `requires_address` (bool, default true para serviços presenciais)
- `service_radius_km` (raio de atendimento)
- `travel_fee_per_km` (numérico, opcional)
- `travel_fee_base` (numérico, opcional)

Coluna nova em `service_bookings`:
- `travel_fee` (numérico)
- `factors_snapshot` (jsonb — guarda o que o cliente preencheu e como foi calculado, p/ auditoria)
- `total_price` (numérico — preço final efetivo, separado de `price_agreed`)

## 3. UI — onde o profissional configura

Em `src/features/servicos/` (gestão dos `service_types` do profissional), adicionar nova aba/seção dentro do editor do tipo de serviço:

- **`editor_fatores_preco.tsx`** — lista de fatores com adicionar/editar/remover, campo de label, tipo, unidade, preço por unidade, opções.
- **`editor_endereco_servico.tsx`** — toggle "exige endereço", raio em km, taxa base, taxa por km.
- Pré-visualização do cálculo (exemplo: "Casa de 80m² · 4h → R$ 240,00").

## 4. UI — onde o cliente preenche (tela de agendamento)

Em `src/features/passageiro/components/agendamento_servico.tsx`, adicionar **antes** dos "Seus dados" duas novas seções, renderizadas só se o serviço atual exigir:

### 4.1 `secao_endereco_atendimento.tsx`
- Campo CEP com auto-preenchimento via ViaCEP (já há `campo_endereco.tsx` no projeto — reaproveitar).
- Logradouro / número / complemento / bairro / cidade / UF.
- Campo "ponto de referência".
- Aviso de fora-de-raio: se distância > `service_radius_km`, bloqueia confirmação com mensagem clara.

### 4.2 `secao_fatores_servico.tsx`
- Renderiza dinamicamente cada `pricing_factor` configurado pelo profissional (similar ao `formulario_briefing.tsx` que já existe).
- Inputs `number` com stepper, `select` com opções.
- Atualiza em tempo real um **resumo de cálculo** no `resumo_servico_sticky.tsx`:
  ```
  Base: R$ 80,00
  + 80m² × R$ 1,50 = R$ 120,00
  + Deslocamento (3km): R$ 9,00
  Total: R$ 209,00
  ```

### 4.3 Botão "Confirmar"
Passa a mostrar o **total calculado** em vez de `service.price`.

## 5. Backend — Edge Function `book-service`

Em `supabase/functions/book-service/index.ts`:
1. Aceitar `address` e `factors` no payload.
2. **Recalcular o total no servidor** (nunca confiar no cliente) usando `service_pricing_factors` + `travel_fee_*` + distância.
3. Persistir endereço em `service_booking_addresses` na mesma transação do booking.
4. Salvar `factors_snapshot`, `travel_fee`, `total_price` no booking.
5. Validar raio de atendimento; rejeitar com `OUT_OF_RANGE` se fora.

## 6. Migrations (SQL)

```sql
-- service_types: campos de endereço/deslocamento
alter table service_types
  add column requires_address boolean not null default false,
  add column service_radius_km numeric,
  add column travel_fee_base numeric default 0,
  add column travel_fee_per_km numeric default 0;

-- fatores de preço dinâmicos
create table service_pricing_factors (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid not null references service_types(id) on delete cascade,
  tenant_id uuid not null,
  key text not null,
  label text not null,
  input_type text not null check (input_type in ('number','select')),
  options jsonb,
  unit_price numeric default 0,
  min_value numeric,
  max_value numeric,
  step numeric default 1,
  default_value numeric,
  required boolean default false,
  ordem int default 0,
  created_at timestamptz default now()
);

-- endereço do atendimento
create table service_booking_addresses (
  booking_id uuid primary key references service_bookings(id) on delete cascade,
  tenant_id uuid not null,
  cep text, logradouro text, numero text, complemento text,
  bairro text, cidade text, uf text,
  latitude numeric, longitude numeric, referencia text,
  created_at timestamptz default now()
);

-- snapshot do cálculo
alter table service_bookings
  add column travel_fee numeric default 0,
  add column factors_snapshot jsonb,
  add column total_price numeric;
```

Mais policies de RLS espelhando as existentes em `service_types` / `service_bookings`.

## 7. Arquivos a criar/editar

**Criar**
- `src/features/servicos/components/editor_fatores_preco.tsx`
- `src/features/servicos/components/editor_endereco_servico.tsx`
- `src/features/servicos/utils/calculadora_preco_servico.ts` (função pura usada no front e portada como TS para edge function)
- `src/features/passageiro/components/secao_endereco_atendimento.tsx`
- `src/features/passageiro/components/secao_fatores_servico.tsx`
- `supabase/migrations/<timestamp>_pricing_factors_e_endereco.sql`

**Editar**
- `src/features/passageiro/components/agendamento_servico.tsx` — integra as duas novas seções e o total dinâmico.
- `src/features/passageiro/components/resumo_servico_sticky.tsx` — mostra breakdown.
- `src/features/servicos/types/tipos_servicos.ts` — novos tipos.
- `src/features/servicos/services/servico_servicos.ts` — CRUD de fatores + envio do payload.
- `supabase/functions/book-service/index.ts` — recálculo seguro + persistência do endereço.

## 8. Fora de escopo (sugiro tratar depois)
- Geocoding real (Google/Mapbox) e cálculo de distância — entregamos preparado, mas no MVP a distância pode ser informada pelo cliente ou estimada via CEP.
- Pagamento online proporcional ao total dinâmico (ajustar quando o gateway estiver ativo).
