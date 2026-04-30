
## Problema

Hoje a tela `/cadastrar` oferece apenas 4 opções: **Criar grupo, Motorista, Passageiro, Afiliado**. Não existe entrada para o **profissional de serviço** (barbeiro, manicure, estética, etc.), apesar do backend já suportar via `drivers.professional_type` e `service_categories`.

Resultado: o profissional autônomo não tem caminho claro de cadastro — precisaria criar um grupo manualmente e depois mudar o tipo dentro do painel.

## Solução proposta

Adicionar a opção **"Profissional"** no seletor de tipo de cadastro, criando uma conta + tribo própria automaticamente (como acontece em "Criar grupo"), mas já marcando o usuário como profissional autônomo. O fluxo termina caindo no onboarding de profissional já existente em `/painel`, que coleta os dados completos (categorias, bio, capa, etc.).

### Mudanças na tela de cadastro (`pagina_cadastro.tsx`)

1. Expandir o tipo `TipoCadastro` para incluir `"profissional"`.
2. Adicionar a 5ª opção no grid de seleção, com label **"Profissional"** e descrição curta tipo: *"Para barbeiros, manicures, estetistas e outros autônomos."*
3. O profissional **não** precisa de slug (cria a própria tribo, igual a "Criar grupo").
4. No `signUp`, enviar `metadata.role = "tenant_admin"` e um flag `metadata.intent = "professional"` para diferenciar do dono de grupo de mobilidade.
5. Após signup (e-mail/senha ou Google), redirecionar para `/onboarding` com query `?modo=profissional` — a página de onboarding cria a tribo e pré-popula `drivers.professional_type`.

### Mudanças no onboarding de tribo (`/onboarding`)

1. Ler `?modo=profissional` na URL.
2. Quando for profissional: chamar `create_tenant_with_owner` (mesmo RPC já usado), depois `ensure_driver_profile` e atualizar `drivers.professional_type` para algo diferente de `"driver"` (por exemplo `"service"` — confirmar valor padrão lendo dados existentes).
3. Redirecionar direto para `/painel`, onde o **banner de onboarding profissional** (já implementado) vai pedir os campos restantes (avatar, bio, categorias, capa, cidade, telefone).

### Rotas amigáveis

Adicionar aliases em `src/App.tsx`:
- `/profissional/cadastro` → `/cadastrar?tipo=profissional`
- `/profissional/criar-conta` → `/cadastrar?tipo=profissional`

Isso espelha o que já existe para `/profissional/login`.

### Texto e UX

- Subtítulo dinâmico quando `tipoCadastro === "profissional"`: *"Crie sua agenda e portfólio em poucos passos."*
- Ao escolher "Profissional", esconder campo de slug (não é necessário).
- Tela de "verifique seu email" mostra mensagem específica: *"Após confirmar, vamos criar seu espaço e pedir alguns dados rápidos."*

## Detalhes técnicos

**Arquivos editados:**
- `src/features/autenticacao/pages/pagina_cadastro.tsx` — adicionar opção "profissional", lógica de metadata e redirect
- `src/features/onboarding/pages/pagina_onboarding.tsx` (ou equivalente) — ler `?modo=profissional` e setar `professional_type` ao criar tribo
- `src/App.tsx` — adicionar rotas alias

**Sem mudanças de banco:** as colunas `drivers.professional_type` e `drivers.service_categories` já existem. O fluxo apenas as utiliza.

**Encadeamento com onboarding existente:** o wizard de 4 passos no `/painel` (já implementado) é a fonte da verdade para coletar dados completos do profissional. Esta mudança apenas garante que ele chegue lá com a tribo e o registro `drivers` já criados.

## Fora do escopo

- Não vou alterar o wizard de onboarding profissional (já existe e funciona).
- Não vou criar páginas de marketing/landing específicas para profissionais.
- Não vou mexer em RLS ou triggers.

## Próximo passo

Antes de implementar, preciso confirmar 2 pontos rápidos com você:

1. **Valor de `professional_type`**: hoje o default é `"driver"`. Para o profissional autônomo, qual valor devo usar? Sugestão: `"service"` (genérico, e o tipo específico — barber, nails, etc. — entra como categoria).
2. **Onboarding de tribo**: o profissional deve passar pela tela `/onboarding` (escolher nome/slug da tribo) ou eu gero automaticamente a partir do nome dele e mando direto pro `/painel`?
