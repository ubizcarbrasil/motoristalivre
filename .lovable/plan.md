

## Diagnóstico

Os atalhos foram adicionados corretamente em `/painel` (painel do motorista comum), mas você está em `/admin` (painel do dono do grupo). São duas telas diferentes:

- `/painel` → motorista pessoa física (motorista comum) → **tem os atalhos**
- `/admin` → dono/admin do grupo → **não tem os atalhos** (é onde você está)

Como você é dono do grupo, faz total sentido ter os mesmos 3 atalhos no `/admin`.

## O que vou fazer

### 1. Adicionar os 3 atalhos no header do `/admin`

Em `src/features/admin/components/header_admin.tsx`, adicionar 3 botões à direita do título:
- **Solicitar corrida** → `navigate("/{tenantSlug}")` (pega o slug do tenant do dono logado)
- **Painel motorista** → `navigate("/painel")` (caso o admin também tenha cadastro de motorista)
- **Instalar app** → `navigate("/instalar")`

No mobile (viewport atual 430px), mostrar só ícones; no desktop, ícone + label.

### 2. Buscar o tenant slug do admin logado

Criar hook curto `src/features/admin/hooks/hook_tenant_admin.ts` que consulta `users` → `tenant_id` → `tenants.slug` do usuário logado (uma vez no mount).

### 3. Botão "Voltar ao /admin" no app de corridas

O botão flutuante "Painel" que já existe em `pagina_passageiro.tsx` hoje vai pra `/painel`. Vou ajustar pra detectar se o usuário é dono do grupo (consulta `tenants.owner_id = user.id`) e nesse caso o botão leva pra `/admin` em vez de `/painel`. Se for só motorista comum, continua indo pra `/painel`.

## Arquivos editados

- `src/features/admin/components/header_admin.tsx` — adicionar 3 botões de atalho
- `src/features/admin/hooks/hook_tenant_admin.ts` — **novo** hook pra pegar slug
- `src/features/passageiro/hooks/hook_eh_motorista.ts` — estender pra detectar também se é admin/dono e retornar a rota de volta correta (`/admin` ou `/painel`)
- `src/features/passageiro/pages/pagina_passageiro.tsx` — usar a rota retornada pelo hook

## Como testar

1. Logar como dono do grupo → ir em `/admin` → ver 3 botões no topo da tela ao lado de "Dashboard"
2. Clicar em **Solicitar corrida** → vai pro app de passageiro do seu grupo
3. No app de passageiro, clicar no botão flutuante "Painel" → volta pro `/admin`
4. Clicar em **Instalar app** → tutorial de PWA

