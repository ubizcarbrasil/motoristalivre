

## Diagnóstico do badge piscando

Confirmei pelo código + banco:
- Publication `supabase_realtime` inclui `ride_dispatches` ✅
- RLS permite SELECT pelo driver dono ✅
- Card de corrida **chega** (IMG_6001 mostra "99s Aceitar/Recusar") via polling de 5s ✅
- Mas o badge fica vermelho e às vezes pisca pra verde

**Causas reais identificadas em `hook_dispatch_realtime.ts`:**

1. **Nome de canal com `Date.now()`**: cada reconexão cria nome único, e canais antigos demoram a ser garbage-collected. O servidor pode rejeitar/fechar o canal novo se ainda tem o antigo aberto, gerando loop `SUBSCRIBED → CLOSED → reconexão`.

2. **Reage a `CLOSED` igual a erro**: `CLOSED` acontece também em desconexões normais (renovação de token JWT, troca de aba, sleep do iOS). Tratar como erro dispara reconexão imediata e backoff resetado a cada nova conexão bem-sucedida — gera o piscar verde↔vermelho.

3. **`sincronizarComBanco` na dependência do `useEffect`**: como `useCallback` depende de `userId`, é estável, mas qualquer recriação por mudança de identidade de função reinicia o effect inteiro (cleanup + remontagem do canal). Isso por si só não está acontecendo aqui, mas é fragilidade.

4. **`setRealtimeAtivo(false)` no cleanup**: ao desmontar/remontar (HMR, navegação entre abas internas), o badge pisca pra vermelho mesmo quando vai reconectar em milissegundos.

5. **Sem debounce visual**: o usuário vê cada transição instantaneamente, mesmo as de microssegundos.

## Plano de correção

### 1. Estabilizar conexão realtime (`hook_dispatch_realtime.ts`)
- **Nome de canal estável**: `dispatch-driver-${userId}` (sem `Date.now()`). Evita acumular canais zumbis.
- **Ignorar `CLOSED` como erro**: só reconectar em `CHANNEL_ERROR` e `TIMED_OUT`. `CLOSED` é estado normal pós-cleanup.
- **Backoff melhorado**: começar em 2s, max 15s, e **só** marcar `realtimeAtivo=false` depois de 3s sem reconectar (debounce).
- **Não setar `realtimeAtivo=false` no cleanup**: deixa o estado seguir o ciclo natural sem flicker.
- **Remover `sincronizarComBanco` da dep**: usar ref interna pra ela, deixar o effect com dep só `[userId]`.

### 2. Polling adaptativo
- Polling continua a 5s, mas se realtime estiver `SUBSCRIBED` há mais de 30s, reduzir polling pra 15s (economia + evita request desnecessário).

### 3. Badge mais tolerante (`header_painel.tsx`)
- Adicionar estado **"Conectando…"** (cinza/amarelo) pros primeiros 5s de carregamento ou durante reconexão, pra evitar flash vermelho enganoso.
- Só mostrar vermelho **"Sem conexão"** se ficou >10s sem realtime ativo.

### 4. Diagnóstico opcional
- `console.log` dos status do canal (`SUBSCRIBED`, `CLOSED`, `TIMED_OUT`, etc.) com prefixo `[realtime-dispatch]` pra você conseguir ver na próxima execução o que está acontecendo de fato.

## Arquivos a editar
- `src/features/painel/hooks/hook_dispatch_realtime.ts` (estabilizar canal, debounce, logs)
- `src/features/painel/components/header_painel.tsx` (estado "Conectando…")

Sem migração de banco. Sem mudança em nenhum outro arquivo.

## Como testar depois
1. Abrir `/painel` no celular → badge inicia "Conectando…" (cinza), em ~2s vai pra verde "Pronto"
2. Esperar 1 minuto olhando — badge **não pisca**
3. Disparar corrida via `/dev/simular-dispatch` → card aparece, som toca
4. Abrir DevTools (desktop) e ver no console os `[realtime-dispatch] SUBSCRIBED` apenas uma vez

