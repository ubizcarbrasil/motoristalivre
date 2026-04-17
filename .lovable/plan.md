

## Diagnóstico da experiência ruim

5 problemas reais cruzados com o código:

**1. "Lento, não parece PWA"** — `index.html` tem manifest mas **não há service worker registrado**. Sem `vite-plugin-pwa`, sem precache. Cada abertura baixa tudo de novo.

**2. "Som só toca com tela aberta"** — Tudo client-side. Quando motorista bloqueia o celular, o navegador suspende JS e o WebSocket cai (logs confirmam: `CHANNEL_ERROR` toda vez no `visibility → visible`). **Não há Web Push nem Notification API**. Sem service worker, não dá pra acordar o app.

**3. "Aceitar demora pro passageiro ver"** — `hook_corrida_aceita.ts` provavelmente sem polling fallback agressivo (motorista tem 5s, passageiro precisa ser <2s porque está esperando ansioso).

**4. "Chat demora enviar"** — `hook_chat_realtime.ts` provavelmente faz `await insert` antes de mostrar a bolha (sem otimistic update). 300-800ms de lag perceptível.

**5. "Botões travando"** — Falta haptic, falta `touch-action: manipulation` (delay 300ms iOS), animação `animate-pulse-subtle` competindo com renders.

## Plano de ataque (4 frentes)

### Frente 1 — PWA real
- Instalar `vite-plugin-pwa` com Workbox
- Guardar registro contra iframes/preview hosts (regra do Lovable)
- `navigateFallbackDenylist: [/^\/~oauth/]`
- Refinar `manifest.json` (já existe parcial)
- Resultado: app instalado abre em ~300ms

### Frente 2 — Push em background pro motorista
- Service Worker + Web Push API + VAPID
- Migration: coluna `push_subscription jsonb` em `drivers`
- Edge function `send-push` (web-push + VAPID)
- `dispatch-ride` dispara push junto com criar `ride_dispatches`
- Toque na notification abre app já no card de aceite
- Funciona com tela bloqueada em Android e iOS 16.4+ (PWA instalado)

### Frente 3 — Otimistic UI + realtime mais agressivo
- **Chat**: bolha aparece em <50ms com status "enviando…" → "enviado"
- **Passageiro vendo aceite**: polling 2s + reconexão visibility-aware (igual motorista mas mais rápido)
- **Botão Aceitar**: feedback visual + haptic em <16ms antes do insert completar

### Frente 4 — Polimento tátil
- `navigator.vibrate(50)` nos botões críticos (Aceitar, Recusar, Enviar)
- `touch-action: manipulation` global
- Trocar `animate-pulse-subtle` por animação CSS pura mais leve

## Arquivos a editar/criar

**PWA:**
- `vite.config.ts`, `package.json`, `public/manifest.json`, `index.html`, `src/main.tsx` (guard iframe)

**Push:**
- Migration: `drivers.push_subscription`
- `supabase/functions/send-push/index.ts` (novo)
- `supabase/functions/dispatch-ride/index.ts` (editar — disparar push)
- `src/compartilhados/services/servico_push.ts` (novo)
- `src/features/painel/hooks/hook_push_notification.ts` (novo)
- `public/sw-push.js` (handler de push do SW)
- Secrets novos: `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY` (eu gero ambos)

**Realtime + otimistic:**
- `src/compartilhados/hooks/hook_chat_realtime.ts`
- `src/features/passageiro/hooks/hook_corrida_aceita.ts`
- `src/compartilhados/components/chat/input_mensagem.tsx`
- `src/features/painel/components/card_dispatch.tsx`

**Polimento:**
- `src/index.css`, `src/compartilhados/utils/haptic.ts` (novo)

## ⚠️ Decisões antes de eu implementar

**Push em background** — caminho recomendado: **Web Push (PWA instalado)**. Funciona em Android e iOS 16.4+ se o motorista adicionar o app à tela inicial. Sem custo, rápido de implementar. Capacitor (app nativo nas lojas) fica pra depois quando você for publicar.

**Push pro passageiro também?** Recomendo **só motorista por enquanto** — ele perde corrida se não vê. O passageiro normalmente está com app aberto esperando. Adicionamos depois se necessário.

**Estratégia de execução** — recomendo **tudo de uma vez nesta rodada** porque os problemas se potencializam: sem PWA não tem push, sem push o som não resolve, sem otimistic UI parece amador mesmo com tudo rápido.

Se quiser dividir, a ordem seria: **(1) Otimistic UI + polimento** (resolve "amador" em 1 rodada) → **(2) PWA + Push** (resolve "não chega chamada" em outra rodada).

Vou seguir com **tudo de uma vez, Web Push, só motorista** salvo se você indicar diferente na próxima mensagem.

