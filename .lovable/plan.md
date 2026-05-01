
## Diagnóstico dos 4 problemas

**1) Telas de motorista aparecendo para profissional de serviço**
A tribo `papa-léguas` foi criada como tribo de mobilidade (`active_modules: ["mobility"]`), mas o usuário agora atua como prestador de serviços. O painel **não lê `active_modules` da tribo** — `buscarTenantDoMotorista` só seleciona `id, name, slug`. Resultado: tudo aparece misturado:
- AbaInicio mostra dispatch de corrida + grid de stats de corridas + agenda de serviços ao mesmo tempo.
- AbaTribo mostra sub-abas Motoristas/Afiliados/CRM/Corridas/Comissões mesmo para tribo só de serviços.
- AbaConfiguracoes mostra `SecaoMeuPreco` (Bandeira / R$ por km / R$ por minuto — específico de mobilidade) para prestador de serviços.

**2) Menu inferior "se mexendo para cima"**
Não é o menu que se mexe. O `BotaoPreviewVitrine` usa `fixed right-4 bottom-24 z-30` e fica permanentemente flutuando acima do conteúdo (visível nas IMG_6558 e IMG_6559 sobrepondo "Ver vitrine" sobre conteúdo + perto do menu). Quando a página rola, ele permanece flutuando, dando aparência de elemento "subindo". Além disso ele aparece **dentro da AbaConfiguracoes** mesmo quando o usuário está em outra seção que rolou.

**3) "Tá mostrando papa-léguas"**
A tribo `papa-léguas` é de mobilidade. O usuário virou profissional de serviço, mas a tribo dele continua com módulo `mobility`. Vai aparecer no header e no AbaTribo até migrar o módulo dela para `services` ou criar uma nova tribo. A UI também não permite ele trocar/migrar o módulo da tribo existente.

**4) Versão mobile PWA precisa aplicar em tudo**
As capturas confirmam viewport mobile 430×761 já é onde tudo é desenvolvido, então o pedido é: garantir que correções aplicadas funcionem no PWA standalone (sem scroll horizontal, safe-area, botão flutuante respeitando `env(safe-area-inset-bottom)` e padding-bottom do menu fixo).

---

## Plano de implementação

### Passo 1 — Carregar `active_modules` da tribo no painel
- Atualizar `buscarTenantDoMotorista` em `src/features/painel/services/servico_painel.ts` para incluir `active_modules` no select.
- Atualizar tipo do `tenant` em `hook_painel.ts` para `{ id, name, slug, active_modules: string[] }`.
- Adicionar derivações: `temMobilidade = active_modules.includes("mobility")`, `temServicos = active_modules.includes("services")`.

### Passo 2 — AbaInicio condicional
- Esconder `CardDispatch`, `GridStats` (faturamento de corrida), `ListaCorridas`, `ToggleLocalizacao` quando `!temMobilidade`.
- Esconder `SecaoAgendaHoje` quando `!temServicos`.
- Quando só serviços: header sem switch online/offline (não faz sentido para prestador) — substituir por badge "Aceitando agendamentos".

### Passo 3 — AbaTribo condicional
- Filtrar `SUB_ABAS` em `aba_tribo.tsx`: para tribo só `services`, remover `motoristas`, `afiliados`, `corridas`, `comissoes`. Manter `dashboard` (Visão), `crm`, `carteira`, `identidade`, `regras`.
- Para tribo só `mobility`, esconder seções que dependam de serviços (não há ainda, mas estrutura suporta).
- Passar `activeModules` da tribo como prop de `AbaTribo` (já temos via `triboAtiva` mas precisamos guardar `active_modules` na lista de tribos — atualizar `useTribosMotorista` para incluir).

### Passo 4 — AbaConfiguracoes condicional
- Esconder `SecaoMeuPreco` (bandeira/km/minuto) quando `!temMobilidade`.
- Esconder `SecaoRegrasLink` (despacho de corrida) quando `!temMobilidade`.
- Manter o seletor "Tipo de profissional" SOMENTE em tribos com `mobility` (em tribo só de serviços, o tipo é fixo em `service_provider`, sem sentido oferecer "driver" ou "both").
- Esconder `SeletorSomChamada` (alerta de chamada de corrida) quando `!temMobilidade`.

### Passo 5 — Corrigir botão flutuante "Ver vitrine"
- Remover `fixed` do `BotaoPreviewVitrine`. Transformar em botão inline dentro do fluxo da seção "Módulo Serviços" (após `SecaoEquipeAdmin`), com largura total e `mb-4`.
- Alternativa: manter flutuante apenas quando o usuário está visualmente na seção de portfólio/serviços, mas é mais simples colocar inline. Resolve sobreposição com menu inferior e a sensação de scroll bagunçado.

### Passo 6 — Permitir migrar/desativar módulo da tribo (resolve "papa-léguas")
- Em `AbaTribo > SecaoRegras` (ou criar `SecaoModulosTribo` em `src/features/admin/components/`): mostrar checkboxes "Mobilidade" e "Serviços" lendo/gravando `tenants.active_modules`.
- Apenas dono da tribo (`papel === "dono"`) pode alterar.
- Ao desativar mobility: confirmar com diálogo que as funcionalidades de corrida ficarão indisponíveis.
- Migração: criar SQL migration para adicionar índice/garantir default. Sem mudar dados existentes (já decidido em rodada anterior).

### Passo 7 — PWA / safe-area
- Em `src/index.css`, garantir `body { padding-bottom: env(safe-area-inset-bottom); }` aplicado via classe utilitária.
- `NavegacaoInferior`: adicionar `pb-[env(safe-area-inset-bottom)]` ao `<nav>` para PWA em iOS.
- Conferir que todos os containers de página usam `pb-24` (já fazem) — sem alteração necessária além do safe-area.

### Passo 8 — Testes
- Adicionar testes unitários para:
  - `aba_inicio.test.tsx`: renderiza sem `CardDispatch` quando `active_modules = ["services"]`.
  - `aba_tribo.test.tsx`: oculta sub-abas de mobilidade quando tribo é só `services`.
  - `aba_configuracoes.test.tsx`: oculta `SecaoMeuPreco` quando só serviços.

---

## Detalhes técnicos

**Arquivos editados:**
- `src/features/painel/services/servico_painel.ts` — incluir `active_modules`
- `src/features/painel/hooks/hook_painel.ts` — atualizar tipo do tenant
- `src/features/painel/hooks/hook_tribos_motorista.ts` — incluir `active_modules` na lista
- `src/features/painel/types/tipos_tribos.ts` — campo `active_modules: string[]`
- `src/features/painel/components/aba_inicio.tsx` — props + condicionais
- `src/features/painel/components/aba_tribo.tsx` — filtro de SUB_ABAS
- `src/features/painel/components/aba_configuracoes.tsx` — esconder seções de mobilidade
- `src/features/painel/components/header_painel.tsx` — ajustar switch online só para mobility
- `src/features/painel/components/botao_preview_vitrine.tsx` — remover fixed, virar inline
- `src/features/painel/pages/pagina_painel.tsx` — propagar `active_modules` para abas
- `src/features/painel/components/navegacao_inferior.tsx` — safe-area iOS
- `src/features/admin/components/secao_regras.tsx` (ou nova `secao_modulos_tribo.tsx`) — toggle de módulos
- `src/features/admin/types/tipos_admin.ts` — se criar nova seção
- `src/index.css` — utilitário safe-area se ainda não existir

**Sem migração SQL nova** — a coluna `active_modules` já existe em `tenants`. Apenas leitura/escrita pela UI.

**Comportamento "Papa-léguas":** O usuário vai poder, em AbaTribo > Regras, marcar/desmarcar "Mobilidade" e "Serviços". Ao salvar com só "Serviços", o painel inteiro recarrega no formato de serviços (sem dispatch, sem preço por km, sem sub-abas Motoristas/Afiliados/Corridas/Comissões).
