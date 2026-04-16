

## Implementar aceitar/recusar dispatch + Realtime no painel motorista

### 1. Hook novo `hook_dispatch_realtime.ts`
Cria hook dedicado em `src/features/painel/hooks/hook_dispatch_realtime.ts` que:
- Recebe `userId` (motorista) e `tenantTimeoutSec` (configurável).
- Faz `subscribe` no canal `dispatches:${userId}` escutando `postgres_changes` em `ride_dispatches` filtrado por `driver_id=eq.${userId}`.
- Trata eventos `INSERT` (novo dispatch pending) → busca dados completos da `ride_request` e seta como `dispatchAtivo`.
- Trata `UPDATE` → se response mudar para qualquer coisa diferente de `pending`, limpa o dispatch atual.
- Expõe estado `realtimeAtivo: boolean` (true quando `SUBSCRIBED`).
- Cleanup do canal no unmount.

### 2. Service `servico_painel.ts` — novas funções
- `aceitarDispatch(dispatchId)` → chama edge function `dispatch-ride` com `action: "accept"` (lógica atômica de aceitar + cancelar outros + criar ride já existe na edge function, conforme linhas 175-216).
- `recusarDispatch(dispatchId)` → chama edge function `dispatch-ride` com `action: "reject"` (já dispara `tryNextDriver` automaticamente).
- `marcarDispatchTimeout(dispatchId)` → chama edge function com nova action `timeout` (vamos adicionar) que marca como `timeout` e dispara `tryNextDriver`.

Vantagem: toda a lógica transacional (cancelar outros dispatches, criar ride, retentar próximo motorista, audit log) já está implementada no edge function. Centralizamos lá em vez de duplicar no client (mais seguro e atômico).

### 3. Edge function `dispatch-ride` — adicionar action `timeout`
Adicionar case `"timeout"` no switch HTTP (linha 491) que chama `marcarDispatchTimeout(dispatch_id)` + `tryNextDriver(...)`. Manter todas as outras actions intactas.

### 4. Buscar `dispatch_timeout_sec` do tenant
Adicionar `buscarTimeoutDispatch(tenantId)` em `servico_painel.ts` que lê `tenant_settings.dispatch_timeout_sec`. Usado para timeout dinâmico em vez do hardcoded `TIMEOUT_DISPATCH_SEG = 28`.

### 5. `hook_painel.ts` — integrar Realtime
- Importar `useDispatchRealtime` e usar `dispatch` vindo dele em vez do estado local atual (mantém a busca inicial via `buscarDispatchAtivo` para hidratar quando há dispatch já pendente ao abrir o app).
- Expor `realtimeAtivo` no retorno.
- Buscar e expor `timeoutSec` do tenant.
- Adicionar handlers `aceitar` e `recusar` que chamam o serviço e limpam o dispatch local.

### 6. `CardDispatch` — wireup real
- Receber `timeoutSec` como prop (em vez de usar constante).
- `onAceitar` e `onRecusar` agora vêm do hook e fazem ação real.
- Quando timer chega a 0, chamar `onTimeout` callback (novo prop) que dispara `marcarDispatchTimeout` via service.
- Mostrar estado de loading nos botões durante a ação (evita double-click).

### 7. `aba_inicio.tsx` e `pagina_painel.tsx` — passar handlers
- Substituir `() => {}` pelos handlers reais do hook.
- Passar `timeoutSec` para o `CardDispatch`.

### 8. `header_painel.tsx` — indicador Realtime
Hoje o header mostra Online/Offline baseado em `perfil.is_online`. Adicionar pequeno indicador visual extra (bolinha pulsante verde) ao lado do status quando `realtimeAtivo === true`. Se `is_online === true` mas `realtimeAtivo === false`, mostrar bolinha amarela com tooltip "Reconectando…".

---

### Arquitetura/fluxo

```text
[passageiro solicita] → ride_requests INSERT
        ↓
[trigger DB] → POST /dispatch-ride action=trigger → dispatchRide() → INSERT ride_dispatches
        ↓
[Realtime postgres_changes] → motorista vê CardDispatch
        ↓
   ┌────────────────┬────────────────┐
   ▼                ▼                ▼
Aceitar          Recusar         Timeout 28s
   │                │                │
   ▼                ▼                ▼
POST /dispatch-ride action=accept|reject|timeout
   │                │                │
   ▼                ▼                ▼
- update dispatch  - update dispatch  - update dispatch
- cancel others    - tryNextDriver    - tryNextDriver
- create ride
- audit_log
```

### Detalhes técnicos
- Canal Realtime: `supabase.channel('dispatch-driver-${userId}').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_dispatches', filter: 'driver_id=eq.${userId}' }, ...)` + listener de `UPDATE` para limpar quando aceito/cancelado por outro fluxo.
- Estado `realtimeAtivo` derivado do callback `subscribe((status) => setRealtimeAtivo(status === 'SUBSCRIBED'))`.
- `tenant_settings.dispatch_timeout_sec` já existe (default 60); usaremos esse valor; mantemos `TIMEOUT_DISPATCH_SEG = 28` apenas como fallback se a config não carregar.
- A edge function `dispatch-ride` já tem `action: "reject"` que internamente chama `tryNextDriver` — não precisa retrigar via UPDATE de `ride_requests.status`.

### Arquivos afetados
- **Novo**: `src/features/painel/hooks/hook_dispatch_realtime.ts`
- **Editados**: `src/features/painel/hooks/hook_painel.ts`, `src/features/painel/services/servico_painel.ts`, `src/features/painel/components/card_dispatch.tsx`, `src/features/painel/components/aba_inicio.tsx`, `src/features/painel/components/header_painel.tsx`, `src/features/painel/pages/pagina_painel.tsx`, `supabase/functions/dispatch-ride/index.ts`

