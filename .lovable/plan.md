

# Plano: descobrir e resolver por que o motorista não toca

## Diagnóstico baseado nos prints e dados do banco

Confirmei pelo banco:
- O `ride_request` mais recente (`534d194e…`) está com `status = dispatching`
- Foi criado um `ride_dispatches` pro motorista demo `71825cff…` com `response = pending`
- O motorista demo está `is_online = true`
- Os 3 dispatches anteriores expiraram em `timeout` (ninguém aceitou em 60-120s)

Ou seja: **o dispatch chega no banco**, mas no print do painel (IMG_5997) o motorista não vê nenhum card chegando. Causas possíveis:

1. **Você está logado num motorista diferente** do que está recebendo o dispatch (o painel "Boa noite, Motorista" sugere conta de teste — pode não ser o `71825cff…` da TriboCar Demo)
2. **Realtime não conectou** ou perdeu o INSERT (não há fallback de polling)
3. **Mesma conta sendo passageiro e motorista** ao mesmo tempo na outra aba — Supabase Realtime tem comportamento errático nesse caso
4. **Som depende do card aparecer** — se card não aparece, som não toca

## Solução em 3 frentes

### 1. Indicador visual de "estou pronto pra receber" no painel

No header do painel, mostrar um badge claro:
- ✅ **"Pronto pra receber chamadas"** (verde) quando: online + realtime conectado + áudio destravado
- ⚠️ **"Toque na tela pra ativar alertas"** (amarelo) quando áudio ainda não foi destravado
- ❌ **"Sem conexão em tempo real"** (vermelho) quando realtime caiu

Isso elimina a dúvida "será que tá tocando?" — você vê o estado antes mesmo da corrida chegar.

### 2. Fallback de polling + auto-reconexão do realtime

No `hook_dispatch_realtime.ts`:
- Adicionar polling a cada 5s consultando `buscarDispatchAtivo(userId)` como rede de segurança
- Detectar quando o canal cai (`status === 'CHANNEL_ERROR'` ou `'TIMED_OUT'`) e reassinar automaticamente
- Quando voltar do background (visibilitychange), forçar refresh imediato

Assim, mesmo que o realtime falhe, em até 5s o card aparece e o som toca.

### 3. Botão "Testar som agora" + ID do motorista visível

Na aba **Configurações**, junto do seletor de som:
- Botão grande **"Testar alerta de chamada (5 segundos)"** que dispara o som + vibração igualzinho ao real
- Mostrar o **ID do motorista logado** (curto, ex: `71825cff…`) pra você confirmar se a conta logada bate com a que recebe o dispatch

Isso destrava o áudio do iOS de forma explícita e prova que o sistema funciona, sem depender de criar uma corrida fake.

## Arquivos envolvidos

Editar:
- `src/features/painel/hooks/hook_dispatch_realtime.ts` (polling + reconexão + visibilitychange)
- `src/features/painel/components/header_painel.tsx` (badge de status)
- `src/features/painel/pages/pagina_painel.tsx` (passar status de áudio destravado pro header)
- `src/features/painel/components/aba_configuracoes.tsx` (botão de teste + ID visível)
- `src/features/painel/hooks/hook_alerta_dispatch.ts` (expor `audioDestravado` e função `testarAlerta`)

Sem migração de banco — backend está OK.

## Como testar depois

1. Abrir `/painel` no celular do motorista → tocar uma vez na tela → badge verde aparece
2. Em `/painel/configuracoes`: anotar o ID do motorista
3. Ir em `/dev/simular-dispatch` (root_admin) → selecionar exatamente esse motorista pelo ID → disparar
4. Em até 5s o card e o som devem chegar (mesmo se realtime falhar)
5. Botão "Testar alerta" valida som/vibração isoladamente

