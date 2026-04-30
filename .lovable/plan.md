# Adaptar a "Configuração inicial" ao tipo de operação

## Diagnóstico

Hoje a etapa "Configuração inicial" do onboarding mostra **bandeira, preço por km, preço por minuto e modo de despacho** — campos que só fazem sentido para corridas (módulo `mobility`).

Quando o usuário escolhe **Serviços** na etapa anterior, ele está cadastrando um negócio onde a cobrança é por **tipo de serviço**: valor fixo, por hora ou por diária. Os campos atuais não se aplicam.

A boa notícia: o banco já tem a tabela `service_types` com `name`, `description`, `price`, `duration_minutes`, `is_immediate` e os campos de sinal (`deposit_*`). Só falta o **modo de cobrança** e a UI correspondente.

## O que vai mudar

### 1. A etapa "Configuração inicial" passa a ser adaptativa

Detecta o módulo escolhido na etapa anterior:

- **Mobilidade marcada** → mantém a tela atual (bandeira, preço/km, preço/min, despacho, comissão, cashback). Sem alteração para quem opera corridas.
- **Apenas Serviços marcado** → mostra a nova tela "Seus serviços".
- **Ambos marcados** → mostra duas seções (mobilidade + serviços) na mesma etapa.

### 2. Nova tela "Seus serviços" (substitui o conteúdo da configuração quando só Serviços está ativo)

Texto de cabeçalho: "Cadastre os serviços que você oferece. Você pode editar, adicionar mais ou remover depois."

Lista vazia inicialmente, com botão **"+ Adicionar serviço"**. Cada serviço cadastrado vira um card editável com:

- **Nome do serviço** (ex.: "Detalhamento completo", "Consulta", "Diária de motorista particular")
- **Descrição curta** (opcional)
- **Modo de cobrança** (3 opções em pílulas):
  - Valor fixo
  - Por hora
  - Por diária
- **Preço** (R$) — label muda conforme o modo: "Valor", "Valor/hora", "Valor/diária"
- **Duração estimada** (minutos / horas / dias, conforme o modo) — opcional para "fixo"
- **Sinal/depósito** (toggle): se ativado, escolhe % ou R$ fixo
- Botão remover

Validação mínima para avançar: pelo menos 1 serviço com nome e preço preenchidos.

### 3. Comissão e cashback continuam disponíveis

Comissão de transbordo e cashback padrão fazem sentido nos dois modelos (são da operadora, não da corrida). Ficam numa seção comum no final da etapa, independentemente do módulo.

### 4. Persistência

Ao concluir o onboarding, em `servico_onboarding.criarGrupo`:

- `tenant_settings`: continua sendo criado. Quando o módulo é só Serviços, os campos `base_fare`/`price_per_km`/`price_per_min` recebem os defaults atuais do banco (não aparecem para o usuário).
- Para cada serviço cadastrado, insere uma linha em `service_types` com `tenant_id`, `driver_id` (= owner do tenant), `name`, `description`, `price`, `duration_minutes`, e os campos de depósito.

### 5. Modo de cobrança no banco

A tabela `service_types` ainda não tem o campo "modo de cobrança". Vamos adicionar via migração:

- Novo enum `service_pricing_mode` com valores `fixed`, `hourly`, `daily`.
- Nova coluna `service_types.pricing_mode` (default `fixed`, not null).

A conversão de duração para minutos é feita no front antes de gravar (1h = 60min, 1 dia = 1440min) — assim o resto do sistema continua usando `duration_minutes` sem mudança.

## Arquivos afetados

```text
src/features/onboarding/
├── components/
│   ├── etapa_configuracao.tsx           (refatorado: roteia por módulo)
│   ├── secao_configuracao_mobilidade.tsx  (novo: extrai a UI atual)
│   ├── secao_configuracao_servicos.tsx    (novo: lista de serviços)
│   ├── card_servico_onboarding.tsx        (novo: 1 serviço editável)
│   └── secao_comissao_cashback.tsx        (novo: campos comuns)
├── constants/constantes_onboarding.ts   (novo: MODOS_COBRANCA, SERVICO_INICIAL)
├── hooks/hook_onboarding.ts             (adiciona estado `servicos`)
├── services/servico_onboarding.ts       (insere em service_types)
└── types/tipos_onboarding.ts            (novos tipos: ModoCobrança, DadosServico)

supabase/migrations/
└── <timestamp>_service_types_pricing_mode.sql   (enum + coluna)
```

## Detalhes técnicos

### Tipos novos
```ts
type ModoCobranca = "fixed" | "hourly" | "daily";

interface DadosServico {
  id: string;             // uuid local para a lista
  nome: string;
  descricao: string;
  modoCobranca: ModoCobranca;
  preco: number;
  duracao: number;        // na unidade do modo (min/h/dias)
  depositoAtivo: boolean;
  depositoPct: number | null;
  depositoValor: number | null;
}

interface DadosOnboarding {
  // ...campos atuais
  servicos: DadosServico[];   // novo
}
```

### Roteamento da etapa
```tsx
const temMobilidade = modulos.includes("mobility");
const temServicos   = modulos.includes("services");

return (
  <>
    {temMobilidade && <SecaoConfiguracaoMobilidade ... />}
    {temServicos   && <SecaoConfiguracaoServicos   ... />}
    <SecaoComissaoCashback ... />
  </>
);
```

### Migração
```sql
create type service_pricing_mode as enum ('fixed','hourly','daily');
alter table public.service_types
  add column pricing_mode service_pricing_mode not null default 'fixed';
```

## Fora do escopo

- Não muda o onboarding do **profissional individual** (`dialogo_onboarding_profissional`) — ele já não tem essa etapa de preço.
- Não altera o painel pós-onboarding (`secao_meu_preco`, abas de configurações). A edição completa dos serviços continua disponível depois pelo painel.
- Não mexe em RLS de `service_types` (já está correta).

