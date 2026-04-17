

## Objetivo

Adicionar 3 atalhos rápidos:
1. **Painel → Aplicativo de corridas**: botão que leva o motorista logado direto pro app de passageiro do seu próprio grupo (`/{slug-do-tenant}`), sem deslogar.
2. **App de corridas → Painel**: atalho discreto pro motorista voltar ao painel.
3. **Instalar PWA**: atalho dentro do painel pra fixar app na tela do celular.

---

## O que vou fazer

### 1. Botão "Solicitar corrida" no painel do motorista

**Onde**: `src/features/painel/components/aba_inicio.tsx` — adicionar dentro do `AcessoRapido` ou logo abaixo da barra de "Compartilhar localização / Chat".

**Como**:
- Novo item no `AcessoRapido` com ícone `Car`/`MapPin` rotulado **"Solicitar corrida"**.
- Ao clicar, navega para `/{tenantSlug}` (já existe a rota `/:slug` que abre `PaginaPassageiro` com o tenant atual).
- Como o motorista já está autenticado, a sessão Supabase é mantida — ele entra logado direto.

**Arquivos**:
- `src/features/painel/components/acesso_rapido.tsx` (adicionar item "Solicitar corrida" + receber `tenantSlug` e callback `onSolicitarCorrida`)
- `src/features/painel/components/aba_inicio.tsx` (passar `tenantSlug` e callback que faz `navigate(`/${tenantSlug}`)`)

### 2. Atalho "Voltar ao painel" no app de corridas

**Onde**: `src/features/passageiro/pages/pagina_passageiro.tsx` — botão flutuante discreto no canto superior, visível apenas quando o usuário logado for motorista.

**Como**:
- Detectar se o usuário logado tem perfil de motorista (consulta rápida em `drivers` por `id = user.id`).
- Se sim, mostrar botão flutuante com ícone `LayoutDashboard` + label "Painel" no topo direito (acima do mapa, ao lado do botão de perfil que já existe).
- Ao clicar: `navigate("/painel")`.
- Botão escondido durante corrida ativa pra não atrapalhar fluxo.

**Arquivos**:
- `src/features/passageiro/pages/pagina_passageiro.tsx` (adicionar botão + verificação de role)
- Novo hook curto `src/features/passageiro/hooks/hook_eh_motorista.ts` (verifica via `drivers.id = user.id`) — ou inline simples se preferir mais leve

### 3. Atalho "Instalar app" no painel

**Onde**: dentro de **Configurações** (aba já existente) e também como item rápido no `AcessoRapido`.

**Como**:
- Já existe a rota `/instalar` com tutorial completo (iOS e Android).
- Adicionar item **"Instalar app"** com ícone `Download` no `AcessoRapido` que navega para `/instalar`.
- Adicionar também um card destacado em **Configurações** (`aba_configuracoes.tsx`) explicando rapidamente o benefício e o botão "Como instalar" → `/instalar`.

**Arquivos**:
- `src/features/painel/components/acesso_rapido.tsx` (adicionar item "Instalar app")
- `src/features/painel/components/aba_configuracoes.tsx` (adicionar card "Instalar na tela inicial")

---

## Detalhe técnico crítico

- **Sessão preservada**: `navigate("/{slug}")` mantém a sessão Supabase ativa — o motorista chega no app de passageiro já logado e pode pedir corrida normalmente.
- **Detecção de motorista no app de corridas**: vou consultar `drivers` por `user.id` (uma vez no mount). Cache em estado local pra evitar reconsulta.
- **Sem alterações de banco**, sem novas migrations, sem mudança em rotas existentes.

---

## Arquivos editados (resumo)

- `src/features/painel/components/acesso_rapido.tsx` — adicionar 2 itens (Solicitar corrida + Instalar app)
- `src/features/painel/components/aba_inicio.tsx` — passar `tenantSlug` e callback de navegação
- `src/features/painel/components/aba_configuracoes.tsx` — card "Instalar na tela inicial"
- `src/features/passageiro/pages/pagina_passageiro.tsx` — botão flutuante "Painel" pra motoristas logados
- (opcional) `src/features/passageiro/hooks/hook_eh_motorista.ts` — hook novo de detecção

---

## Como testar depois

1. Logar como motorista → no painel aparecem 2 novos atalhos: **"Solicitar corrida"** e **"Instalar app"**.
2. Clicar em "Solicitar corrida" → vai pra `/{slug}` já logado, mostra mapa do app de passageiro.
3. No app de passageiro, ver botão **"Painel"** flutuante no topo → clicar volta pra `/painel`.
4. Clicar em "Instalar app" → abre tutorial passo a passo conforme dispositivo (iOS/Android).
5. Confirmar que durante uma corrida ativa o botão "Painel" some (pra não atrapalhar).

