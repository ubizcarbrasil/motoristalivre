

## Entendi agora

Você quer **unificar** os dois painéis (`/admin` e `/painel`) em **um único ambiente** pro motorista. Hoje existem duas telas separadas que confundem:

- `/painel` → painel do motorista (recebe corridas, vê faturamento próprio)
- `/admin` → painel do dono de tribo/grupo (gerencia motoristas, afiliados, regras)

Como **todo motorista pode ser dono de tribo** (e participar de outras tribos), faz sentido ter **um único painel** que mostra tudo: corridas que ele faz + tribos que administra + tribos que participa.

## Conceito do painel unificado

**Um único painel em `/painel`** com 2 contextos no topo:

1. **"Eu motorista"** (sempre presente) — recebe corridas, faturamento pessoal, carteira, perfil
2. **"Minhas tribos"** — seletor com todas as tribos onde ele é **dono** + tribos onde ele **participa**
   - Se for dono → mostra abas de admin (motoristas, afiliados, comissões, regras, CRM)
   - Se for membro → mostra info da tribo + comissões recebidas dali

Estrutura proposta:

```text
┌─────────────────────────────────────┐
│ Bom dia, Carlos        [Online ●]   │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 Minha tribo: Papaléguas ▼   │ │ ← seletor (donas + participa)
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  [Pronto pra receber chamadas]      │
│  Faturamento │ Corridas │ Comissões │
│  ÚLTIMAS CORRIDAS                   │
├─────────────────────────────────────┤
│  GERIR TRIBO PAPALÉGUAS (se dono)   │
│  → Motoristas, Afiliados, Regras    │
│  → CRM, Comissões, Carteira tribo   │
└─────────────────────────────────────┘
  [Início][Tribos][Carteira][Perfil][Config]
```

## O que vou fazer

### 1. Criar seletor de tribo no header do painel
**Arquivo**: `src/features/painel/components/seletor_tribo.tsx` (novo)
- Dropdown que lista: tribos onde é **dono** (badge "ADMIN") + tribos onde é **membro**
- Hook novo `hook_tribos_motorista.ts` que busca:
  - `tenants WHERE owner_user_id = userId` → tribos próprias
  - `drivers WHERE id = userId` → tribo principal onde dirige
  - (futuro multi-tribo) participações em outras tribos

### 2. Adicionar seção "Gerir tribo" dentro do painel
**Quando for dono da tribo selecionada**, aparece nova aba **"Tribo"** na navegação inferior com sub-abas:
- Visão geral (dashboard com receita do grupo, motoristas online, afiliados)
- Motoristas
- Afiliados
- Regras (preços, comissões, dispatch)
- CRM (passageiros)
- Carteira da tribo

Esses componentes **já existem** em `src/features/admin/components/` — vou reaproveitar dentro do painel.

### 3. Redirecionar `/admin` → `/painel?aba=tribo`
- Manter rota antiga funcionando por compatibilidade (redirect)
- Remover `header_admin.tsx` com os 3 botões (não precisa mais)
- Remover hook `hook_eh_motorista.ts` (não precisa mais — usuário sempre vai pro `/painel`)
- Remover botão "Painel" flutuante no `pagina_passageiro.tsx`

### 4. Atalho único "Solicitar corrida"
Mantém o botão **"Solicitar corrida"** no `acesso_rapido` do painel — leva pra `/{slug-da-tribo-selecionada}` (usa o slug da tribo do seletor).

### 5. PWA "Instalar app" no painel
Mantém atalho de instalação já existente no acesso rápido + card em Configurações.

## Arquivos editados

**Novos**:
- `src/features/painel/components/seletor_tribo.tsx`
- `src/features/painel/components/aba_tribo.tsx` (compõe seções de admin)
- `src/features/painel/hooks/hook_tribos_motorista.ts`
- `src/features/painel/types/tipos_tribos.ts`

**Modificados**:
- `src/features/painel/components/header_painel.tsx` (incluir seletor de tribo)
- `src/features/painel/components/navegacao_inferior.tsx` (adicionar aba "Tribo" condicional)
- `src/features/painel/types/tipos_painel.ts` (adicionar `"tribo"` em `AbaPainel`)
- `src/features/painel/hooks/hook_painel.ts` (gerenciar tribo selecionada)
- `src/features/painel/pages/pagina_painel.tsx` (renderizar `<AbaTribo />`)
- `src/App.tsx` (redirect `/admin` → `/painel?aba=tribo`)

**Removidos/limpos**:
- `src/features/admin/components/header_admin.tsx` (não é mais usado, ou só usado pelo redirect temporário)
- `src/features/passageiro/pages/pagina_passageiro.tsx` (remover botão flutuante "Painel")
- `src/features/passageiro/hooks/hook_eh_motorista.ts` (remover)

## Lógica multi-tribo (preparação)

Hoje o schema tem `drivers.tenant_id` (1 tribo por motorista). Pra suportar **motorista em múltiplas tribos** (caso "Motorista 3"), futuramente vai precisar de tabela `driver_tenant_memberships`. Por enquanto:
- Tribo do `drivers.tenant_id` = tribo principal onde recebe corridas
- Tribos onde `tenants.owner_user_id = userId` = tribos que administra
- O seletor lista as duas categorias unidas

Quando você quiser adicionar multi-tribo de verdade (motorista recebendo corridas de várias tribos ao mesmo tempo), criamos a tabela de membership numa segunda etapa — me avisa.

## Como testar

1. Logar como motorista que é dono de tribo → entra em `/painel`
2. Ver seletor no topo com nome da tribo "Papaléguas" e badge "ADMIN"
3. Continua vendo faturamento próprio, dispatch, últimas corridas (visão motorista)
4. Aparece aba **"Tribo"** na navegação inferior → abre dashboard de admin do grupo
5. Acessar `/admin` antigo → redirecionado pra `/painel?aba=tribo`
6. Botão "Solicitar corrida" → vai pra `/papalegua` (slug da tribo selecionada)
7. App de passageiro **não tem mais** botão "Painel" (volta pelo navegador ou logo)

