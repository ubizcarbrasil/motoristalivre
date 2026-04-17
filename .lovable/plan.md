

## Plano: Melhorias UX do app do passageiro

### 1. Pedir nome + WhatsApp ANTES de buscar (não só ao confirmar)

Hoje só pede dados do guest no clique final "Confirmar". Mover pra antes:

- Em `hook_solicitacao.ts`: criar estado `dadosGuest: {nome, whatsapp} | null` salvo em `localStorage` (`tribocar_guest_dados`).
- Adicionar fluxo "garantir dados" antes do `buscarRotaCallback`. Se for guest e ainda não tem dados, abrir o `DialogoDadosPassageiro` ANTES de mostrar o seletor de veículo.
- Em `confirmarCorridaGuest`, usar os dados já salvos sem reabrir popup.
- Para usuário logado: nada muda.

### 2. Campo "Sua oferta" travado em `0` + sugestões de valor

Problema: `type="number"` com valor `0` não deixa apagar o zero (vira "020"). 

Em `seletor_veiculo.tsx`:
- Trocar `Input type="number"` por `type="text"` com `inputMode="decimal"`, controlando como string interna e parseando para número.
- Limpar o "0" inicial ao focar (selecionar tudo on focus).
- Abaixo do campo, mostrar **4 chips de sugestão** baseados no preço do veículo selecionado:
  - 2 menores: `preco - 2`, `preco - 1`
  - Preço sugerido (destaque)
  - 2 maiores: `preco + 2`, `preco + 5`
- Tap no chip preenche o campo.

### 3. Tela "Buscando" mais imersiva (mapa + carrinhos + botão cancelar)

Substituir o atual `OverlayBusca` (tela preta com ring) por overlay **transparente sobre o mapa**:

- Manter o `<Mapa />` visível por baixo (remover early-return atual em `pagina_passageiro.tsx` que esconde tudo durante "buscando").
- Criar componente novo `overlay_busca_mapa.tsx`:
  - Marker da origem (já existe), em volta dele renderizar 4–6 ícones de carrinho via `divIcon` em raios diferentes.
  - Animação de pulso radial: anel verde expandindo a partir do marker (CSS keyframe).
  - Animação de zoom suave do mapa: `setInterval` chamando `map.setZoom(z±1)` com `flyTo` a cada 3s pra dar sensação de "varrendo".
  - Card flutuante no topo: "Buscando motoristas em {grupoNome}" + contador de tempo.
  - Botão **"Cancelar solicitação"** fixo na parte inferior (vermelho destaque).
- Lógica de cancelamento em `hook_solicitacao.ts`: nova função `cancelarSolicitacao()` que:
  - Faz `UPDATE ride_requests SET status='cancelled' WHERE id=rideRequestId`
  - Limpa `localStorage` do guest
  - Chama `resetarSolicitacao()`

### 4. Performance / carregamento mais ágil

Diagnóstico rápido dos pontos lentos atuais:
- `pagina_passageiro.tsx` carrega Mapa + Perfil + Avaliação + Chat + Rastreamento todos eagerly mesmo sem usar.
- Reverse-geocoding (Nominatim) sem cache.
- Reload completo de tudo após confirmar corrida.

Otimizações:
- **Code-splitting com `lazy()`** para componentes pesados não-críticos:
  - `PaginaPerfilPassageiro`, `TelaChat`, `TelaAvaliacao`, `TelaRastreamento`, `SeletorLocalMapa`, `ListaMotoristasTenant` → `React.lazy` + `Suspense` com fallback nulo.
- **Cache de reverse-geocoding** em `servico_passageiro.ts`: Map em memória + `sessionStorage`, chave = `lat.toFixed(4)_lng.toFixed(4)`.
- **Skeleton no carregamento inicial** em vez do spinner em tela cheia (mostrar placeholder do mapa + bottom sheet vazio).
- **Pré-carregar** `configPreco` em paralelo com `motorista`/`afiliado` (já é, mas garantir `Promise.all`).
- **Reduzir bundle**: confirmar que `leaflet` e `Mapa` ficam num chunk separado via dynamic import quando primeira renderização não exigir mapa imediatamente.

### Arquivos editados/criados

**Criar:**
- `src/features/passageiro/components/overlay_busca_mapa.tsx`
- `src/features/passageiro/components/sugestoes_oferta.tsx`

**Editar:**
- `src/features/passageiro/hooks/hook_solicitacao.ts` — pedir dados antes de buscar; `cancelarSolicitacao`; persistir dados guest.
- `src/features/passageiro/components/seletor_veiculo.tsx` — input controlado como string + chips de sugestão.
- `src/features/passageiro/components/bottom_sheet.tsx` — disparar dialog de dados guest antes do "Buscar motoristas".
- `src/features/passageiro/pages/pagina_passageiro.tsx` — substituir `OverlayBusca` pelo novo overlay com mapa visível; lazy imports.
- `src/features/passageiro/services/servico_passageiro.ts` — cache de reverse-geocoding.
- `src/features/passageiro/components/mapa.tsx` — expor handle pra animar zoom durante busca (via prop `modoBusca?: boolean`).
- (Remover uso do) `overlay_busca.tsx` — manter arquivo mas de