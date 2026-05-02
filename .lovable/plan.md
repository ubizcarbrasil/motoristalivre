
# Fluxo de Solicitação de Orçamento — Seleção por Botões

Hoje o app só tem **agendamento direto** (cliente escolhe profissional + horário). Vamos adicionar um fluxo paralelo de **orçamento**: o cliente navega por categorias, responde um formulário com botões, informa local/contato e a solicitação é distribuída para até N profissionais compatíveis, que enviam propostas.

## Escopo

1. Estrutura de dados para perguntas selecionáveis por categoria/serviço (gerenciável).
2. Fluxo público do cliente (8 passos do PDF).
3. Recebimento das solicitações pelos profissionais e envio de propostas.
4. Acompanhamento pelo cliente (lista de propostas + aceitar/recusar).

## Fluxo do Cliente (mobile, dark)

```text
[1 Categoria] → [2 Subcategoria] → [3 Serviço] → [4 Perguntas]
   → [5 Local/Data] → [6 Contato] → [7 Resumo/Confirmar] → [8 Propostas]
```

Tudo em **botões/chips** (radio/checkbox visuais). Texto livre só onde realmente precisa (observações, número do endereço).

## Modelo de Dados (novas tabelas)

- **`service_quote_templates`** — template de formulário vinculado a `service_categories.id` (e opcionalmente a um `service_types.id` específico). Campos: `nome`, `escopo` (`category` | `service_type`), `ativo`.
- **`service_quote_questions`** — perguntas do template. Campos: `template_id`, `key`, `label`, `tipo` (`single_select` | `multi_select` | `number_chips` | `date_chips` | `text_short` | `photo`), `obrigatorio`, `ordem`, `opcoes` jsonb (lista `{valor, rotulo, icone?}`), `condicional` jsonb (mostrar se outra resposta = X).
- **`service_quote_requests`** — pedido de orçamento. Campos: `tenant_id`, `category_id`, `service_type_id?`, `client_id?` / `guest_passenger_id?`, `respostas` jsonb (snapshot perguntas+respostas), `endereco` jsonb (CEP/log/num/bairro/cidade/UF + lat/lng), `urgencia` (`agora` | `hoje` | `esta_semana` | `data_marcada`), `data_desejada?`, `max_propostas` (1/2/4), `fotos` text[], `observacao?`, `status` (`open` | `closed` | `expired` | `cancelled`), `expires_at`.
- **`service_quote_offers`** — proposta de um profissional. Campos: `request_id`, `driver_id`, `tenant_id`, `valor`, `prazo_min`/`prazo_max` (em dias) ou `data_disponivel`, `mensagem`, `status` (`pending` | `accepted` | `declined` | `withdrawn`), `valid_until`.
- **`service_quote_dispatches`** — controle de quem foi notificado (semelhante a `ride_dispatches`): `request_id`, `driver_id`, `dispatched_at`, `responded_at`, `response`.

RLS:
- Cliente vê seus pedidos e propostas recebidas; pode cancelar pedido próprio.
- Profissional vê pedidos para os quais foi despachado e gerencia suas próprias propostas.
- Admins do tenant veem tudo do tenant. Templates: leitura pública, escrita só `root_admin` / `tenant_admin`.

## Templates Inicialmente Cadastrados (seed)

A partir do PDF, seedar templates para as 6 categorias prioritárias com perguntas exatas do documento:
Limpeza (Diarista), Reparos Residenciais, Ar-condicionado, Beleza em domicílio, Pet, Fretes/Entregas.

Perguntas comuns adicionadas a todos: **Urgência** (`Agora` / `Hoje` / `Esta semana` / `Escolher data`), **Quantos profissionais quer receber** (1 / 2 / 4), **Foto** (opcional), **Observação curta** (opcional).

## Frontend — nova feature `orcamentos`

```
src/features/orcamentos/
├─ pages/
│  ├─ pagina_solicitar_orcamento.tsx        # wizard 8 passos
│  └─ pagina_propostas_recebidas.tsx        # lista pro cliente acompanhar
├─ components/
│  ├─ passo_categoria.tsx
│  ├─ passo_subcategoria.tsx
│  ├─ passo_servico.tsx
│  ├─ passo_perguntas.tsx                   # renderer dinâmico de questions
│  ├─ passo_local_data.tsx                  # CEP + chips de urgência
│  ├─ passo_contato.tsx                     # nome + whatsapp (auto se logado)
│  ├─ passo_resumo.tsx
│  ├─ pos_envio_propostas.tsx               # tela 8: lista de ofertas
│  ├─ chip_opcao.tsx                        # botão radio/check estilizado
│  ├─ card_proposta.tsx
│  └─ painel_pedidos_profissional.tsx       # plug no /painel
├─ hooks/
│  ├─ hook_wizard_orcamento.ts              # estado + persistência localStorage
│  ├─ hook_templates_orcamento.ts
│  └─ hook_pedidos_orcamento.ts
├─ services/
│  ├─ servico_templates_orcamento.ts
│  ├─ servico_orcamentos.ts                 # CRUD requests + offers
│  └─ servico_dispatch_orcamento.ts
├─ schemas/
│  └─ schema_orcamento.ts                   # zod por passo
├─ types/
│  └─ tipos_orcamento.ts
├─ constants/
│  └─ constantes_urgencia.ts
└─ utils/
   └─ utilitario_renderer_pergunta.ts
```

Rotas:
- `/orcamento` → entrada (lista de categorias).
- `/orcamento/novo` → wizard.
- `/orcamento/:id` → acompanhamento de propostas do cliente.
- No `/painel` (profissional): nova aba **"Pedidos de orçamento"** com inbox + dialog de envio de proposta.

## Backend — novas Edge Functions

- **`create-quote-request`** — valida payload via zod (template + respostas obrigatórias + endereço normalizado/ViaCEP, reusa o validador do `book-service`), cria request, dispara dispatches para profissionais elegíveis.
- **`dispatch-quote`** — seleção dos profissionais: mesma categoria, `accepting_bookings = true`, dentro de `service_radius_km` (haversine via lat/lng), respeitando `max_propostas` (envia em ondas até preencher).
- **`submit-quote-offer`** — profissional envia proposta (valida que foi despachado e `status=open`).
- **`accept-quote-offer`** — cliente aceita: marca `accepted`, recusa as demais, fecha o request, opcionalmente cria um `service_booking` ligado.
- **`expire-quote-requests`** (cron) — fecha pedidos abertos há > 48h.

## Integração com o que já existe

- Reutiliza `service_categories`, `service_types`, `service_pricing_factors` (perguntas podem herdar fatores existentes do serviço quando houver).
- Reaproveita componente de endereço (`secao_endereco_atendimento`) e validação CEP do `book-service`.
- Aceitação da proposta pode opcionalmente gerar um `service_booking` (status `confirmed`) com `factors_snapshot` derivado das respostas.

## Detalhes Técnicos Curtos

- O `passo_perguntas` é um **renderer dinâmico** que itera `questions` do template e mapeia `tipo` → componente (`ChipRadio`, `ChipCheckbox`, `ChipNumber`, `ChipDate`, `Textarea`, `UploadFoto`). Suporta `condicional` (mostrar pergunta B se resposta A = X) usando avaliador simples sobre o estado.
- Estado do wizard salvo em `localStorage` (`orcamento_rascunho:<tenant>`) para retomar.
- Snapshot completo das perguntas/respostas é salvo no `service_quote_requests.respostas` para auditoria mesmo se o template mudar depois.
- Distância de elegibilidade via fórmula de Haversine no Postgres (criar function `_haversine_km`).
- Notificação de novos pedidos ao profissional via realtime na tabela `service_quote_dispatches`.

## Entregas em ordem

1. Migration: tabelas, enums, RLS, function haversine, triggers `updated_at`, seed dos templates iniciais.
2. Feature `orcamentos` com wizard, types, services e schemas.
3. Edge functions `create-quote-request` + `dispatch-quote`.
4. Inbox no painel do profissional + edge `submit-quote-offer`.
5. Tela de propostas do cliente + edge `accept-quote-offer`.
6. Editor admin de templates (CRUD em `/painel?aba=tribo`) — opcional na primeira leva, podemos manter só seed.
7. Cron `expire-quote-requests`.

Confirma este escopo? Posso já começar pela migration + estrutura da feature.
