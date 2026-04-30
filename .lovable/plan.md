
# Experiência aprimorada de contratação

Objetivo: transformar o link do profissional em uma vitrine completa antes de agendar (categorias, portfólio, equipe/afiliados) e tornar o fluxo de horário/preço inequívoco, com cobrança de sinal para confirmar.

## 1. Perfil público enriquecido

### 1.1 Portfólio de trabalhos por serviço
Novo recurso para o profissional anexar imagens de exemplo a cada `service_type`.

- Tabela nova `service_portfolio_items` (driver_id, service_type_id, image_url, caption, ordem).
- Bucket `branding` reaproveitado (já existe e é público).
- Painel do profissional → aba Configurações → editor por serviço com upload (até 6 imagens por serviço).
- No perfil público, cada card de serviço ganha um carrossel horizontal com as miniaturas. Clique abre lightbox.

### 1.2 Categorias de serviço claras
- Já existe `drivers.service_categories text[]`. Hoje não é exibido.
- Mostrar como chips logo abaixo do nome no `HeaderPerfil` (ex.: “Estética”, “Manicure”, “Limpeza”).
- No painel, formulário com lista controlada (constantes_categorias_servico) + free-text complementar.

### 1.3 Equipe / afiliados do profissional
Modelo: outros profissionais do mesmo tenant que o cliente também pode contratar a partir do mesmo link (afiliação cruzada de áreas diferentes).

- Nova tabela `professional_team_members` (owner_driver_id, member_driver_id, headline, ordem). RLS: `owner_driver_id = auth.uid()` para escrita; SELECT público.
- Painel: aba “Minha equipe” — busca outros drivers do mesmo tenant e adiciona à vitrine pessoal com headline curto.
- Perfil público: nova seção `SecaoEquipePublica` com avatares + categoria + botão “Ver perfil”, levando para `/[slug]/perfil/[driver_slug]` do membro. Mantém o cliente sempre dentro do tenant.

### 1.4 Reorganização da página de perfil
Ordem nova em `pagina_perfil_motorista.tsx`:
1. HeaderPerfil (com chips de categorias)
2. GridMetricas
3. SecaoBio
4. **SecaoServicosPublica** (com portfólio embutido) ← antes
5. **SecaoEquipePublica** ← novo
6. SecaoDisponibilidadePublica (resumo)
7. DistribuicaoNotas + ListaAvaliacoes
8. Grupo
9. CTA fixo

## 2. Agendamento mais claro

Em `agendamento_servico.tsx`:

### 2.1 Resumo de preço/duração sempre visível
Sticky abaixo do header da página de agendamento mostrando: serviço selecionado, duração formatada, preço total, valor do sinal, troco para pagamento presencial.

### 2.2 Calendário e slots mais legíveis
- Grid de 14 dias hoje fica apertado em 4 colunas no mobile. Mudar para scroll horizontal com cards maiores (data + “X horários”).
- Slots: agrupar visualmente por período (Manhã / Tarde / Noite) com separadores.
- Indicar claramente serviços que não “cabem” no fim do bloco (mensagem inline em vez de slot oculto: “Último horário 17:00 — serviço de 60min”).

### 2.3 Card de serviço com mais info
Cards na seleção mostram, além de duração e preço:
- ícone de portfólio (n imagens)
- tag de categoria
- texto “Sinal R$ X para confirmar” quando ativo

## 3. Pagamento de sinal para confirmar

Lovable Cloud Payments (Stripe seamless) para sinal.

### 3.1 Configuração por profissional
- Novas colunas em `service_types`: `deposit_enabled boolean default false`, `deposit_amount numeric` (valor fixo) ou `deposit_percent numeric`.
- Painel: switch “Cobrar sinal para confirmar” + valor.

### 3.2 Fluxo do cliente
- Se serviço tem sinal:
  1. Cliente escolhe slot → preenche dados.
  2. Em vez de criar booking direto, edge function `book-service` cria booking com `status = 'awaiting_deposit'` e devolve `checkout_url` Stripe.
  3. Redireciona para Stripe Checkout (modo `payment`).
  4. Webhook Stripe → marca booking `confirmed` e libera o slot definitivamente.
  5. Se cliente abandona em 15min, job/edge libera o slot (`cancelled`).
- Se serviço não tem sinal: fluxo atual (`pending`).

### 3.3 Backend
- Migration: adicionar colunas em `service_types`, novo status `awaiting_deposit` no enum (texto, já é text), nova tabela `service_payments` (booking_id, stripe_session_id, amount, status, paid_at).
- Edge function nova `confirm-deposit` (webhook Stripe).
- Edge function `book-service` ajustada para criar Checkout Session quando aplicável.
- Configuração Stripe via tool `enable_stripe_payments` antes de implementar (recomendação após `recommend_payment_provider`).

## 4. Estrutura de arquivos (feature-based)

```text
src/features/motorista/
  components/
    chips_categorias.tsx          (novo)
    secao_equipe_publica.tsx      (novo)
    carrossel_portfolio.tsx       (novo)
  hooks/
    hook_perfil_motorista.ts      (estende — carrega portfolio + equipe)
  services/
    servico_perfil_motorista.ts   (novo — queries de equipe/portfolio)

src/features/painel/components/configuracoes/
  editor_portfolio_servico.tsx    (novo)
  editor_equipe.tsx               (novo)
  campo_sinal_servico.tsx         (novo)

src/features/passageiro/components/
  agendamento_servico.tsx         (refatorado — sticky resumo, slots por período)
  resumo_servico_sticky.tsx       (novo)
  grade_slots_periodo.tsx         (novo)

supabase/functions/
  book-service/index.ts           (estende — cria Checkout Session)
  confirm-deposit/index.ts        (novo — webhook Stripe)
```

## 5. Ordem de implementação

1. Migrations (portfólio, equipe, sinal em service_types, status awaiting_deposit, service_payments).
2. Painel: editor de categorias + portfólio + equipe + sinal.
3. Perfil público: chips, portfólio, seção equipe, reorganização.
4. Agendamento: resumo sticky, slots agrupados, calendário rolável.
5. Pagamento: enable_stripe_payments + integração no book-service + webhook.
6. QA do fluxo completo end-to-end com `prestador-demo`.

## 6. Notas

- Tudo dark mode `#000` / texto `#fff` / accent `#1db865`, IBM Plex Sans, snake_case pt-BR — fiel ao design system.
- Sem quebra para perfis sem portfólio/equipe: seções somem se vazias.
- Categorias e portfólio são opcionais; sinal é opcional por serviço.
- Confirmação de Stripe é obrigatória antes do passo 5 — vou rodar `recommend_payment_provider` e pedir sua aprovação para `enable_stripe_payments` quando chegarmos lá.
