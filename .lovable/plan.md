
Plano focado nos 3 pontos críticos pra o motorista realmente “ouvir” a chamada e ter tempo de responder.

## 1. Som + vibração quando chega chamada

Criar hook `hook_alerta_dispatch.ts` em `src/features/painel/hooks/` que:
- toca um beep/ring repetido enquanto há dispatch pendente
- vibra no mobile (`navigator.vibrate([400, 200, 400])` em loop)
- para automaticamente quando o dispatch some (aceito, recusado, timeout)
- respeita preferência de mute salva em `localStorage`

Som: gerar via `Web Audio API` (oscillator) — sem precisar de arquivo de áudio externo, evita problemas de hospedagem e cache. Toca um padrão tipo “ding-ding” a cada 2s.

Acoplar o hook em `pagina_painel.tsx` observando `dispatchAtivo`.

Adicionar botão de mute/unmute discreto no `card_dispatch.tsx` (ícone `Volume2`/`VolumeX` no canto superior direito do card).

Limitação conhecida no iOS Safari:
- som só toca após primeira interação do usuário com a página
- vamos avisar isso com um toast sutil na primeira vez que o motorista ficar online: “Toque na tela para ativar alertas sonoros”

## 2. Aumentar timeout e deixar visível

Mudar default de `dispatch_timeout_sec` de 60s pra 120s nos `tenant_settings` (via migration que faz `UPDATE` apenas onde ainda está em 60).

No `card_dispatch.tsx`:
- aumentar destaque do contador (número grande no topo do card)
- mudar cor da barra de progresso conforme tempo: verde > amarelo > vermelho
- adicionar pulse mais forte nos últimos 15s
- manter o som mais frequente quando faltar pouco tempo

No painel admin (`secao_regras.tsx`), garantir que o slider de timeout deixa claro o range recomendado (60-180s).

## 3. Modo simulação para testar sozinho

Criar página `/dev/simular-dispatch` (apenas para `root_admin`):

```text
┌──────────────────────────────────┐
│ Simulador de Dispatch            │
├──────────────────────────────────┤
│ Tenant: [select]                 │
│ Motorista alvo: [select online]  │
│ Origem: [input + endereço fake]  │
│ Destino: [input + endereço fake] │
│ Valor: [R$ input]                │
│ Distância: [km]                  │
│                                  │
│ [Disparar corrida fake]          │
└──────────────────────────────────┘
```

Comportamento:
- cria um `ride_request` real com flag `payment_method = 'dinheiro'`
- usa um passenger “fantasma” do tenant (cria/reaproveita `passengers` com id fixo `00000000-...-simulator`)
- chama `dispatch-ride` edge function direto pra esse motorista específico
- mostra log em tempo real do que aconteceu (criou request, criou dispatch, motorista respondeu, etc.)

Vantagem: você testa toque/vibração/timeout do motorista sem precisar de 2 contas, 2 dispositivos ou 2 navegadores.

## 4. Arquivos a criar / editar

Novos:
- `src/features/painel/hooks/hook_alerta_dispatch.ts`
- `src/features/painel/utils/audio_alerta.ts` (Web Audio helper)
- `src/features/dev_simulador/pages/pagina_simulador_dispatch.tsx`
- `src/features/dev_simulador/components/formulario_simulacao.tsx`
- `src/features/dev_simulador/components/log_simulacao.tsx`
- `src/features/dev_simulador/hooks/hook_simulador.ts`
- `src/features/dev_simulador/services/servico_simulador.ts`
- `src/features/dev_simulador/types/tipos_simulador.ts`
- `src/features/dev_simulador/constants/constantes_simulador.ts`

Editar:
- `src/features/painel/components/card_dispatch.tsx` (mute, contador maior, cores progressivas)
- `src/features/painel/pages/pagina_painel.tsx` (acoplar hook de alerta)
- `src/features/painel/constants/constantes_painel.ts` (default 120s)
- `src/App.tsx` (rota `/dev/simular-dispatch` protegida por root_admin)

Migration:
- `UPDATE tenant_settings SET dispatch_timeout_sec = 120 WHERE dispatch_timeout_sec = 60;`
- alterar default da coluna pra 120

## 5. Detalhes técnicos relevantes

- Web Audio API funciona em todos os browsers modernos, inclusive iOS Safari (após gesture)
- `navigator.vibrate` só funciona em Android — no iOS não vibra mas o som compensa
- O timer do card já existe e calcula corretamente o `restante` baseado em `dispatched_at`, então mudar o default não quebra nada
- Edge function `dispatch-ride` já aceita `action: "dispatch"` com `ride_request_id` — o simulador só precisa criar o request e chamar
- Passenger “fantasma”: usar `id` fixo derivado do tenant pra ser idempotente entre simulações

## 6. Teste ponta a ponta

1. Aplicar mudanças e publicar
2. Logar como `root_admin` em `/dev/simular-dispatch`
3. Selecionar motorista demo (online) e disparar
4. Em outra aba, abrir painel do motorista demo
5. Confirmar: card aparece, som toca, vibra (se Android), contador grande, cor muda perto do fim
6. Testar mute/unmute
7. Testar deixar expirar (validar 120s)
8. Testar aceitar e validar fluxo completo até `tela_rastreamento`

