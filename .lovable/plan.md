## Objetivo

Na lista "Serviços oferecidos" (página do profissional `/s/:slug/:driver_slug` e demais lugares que usam `ListaServicosOferecidos`), cada card de serviço deve exibir a **foto + nome do profissional responsável** por aquele serviço — seja o próprio profissional do perfil, seja um afiliado da equipe que executa esse serviço. Além disso, serviços sem nenhum profissional ativo atribuído **não devem aparecer** para o cliente.

## Contexto técnico

- `service_types` tem `driver_id` (profissional dono/responsável) e `is_active`.
- Hoje `useDadosServicoMotorista(driverId)` carrega só `service_types` com `driver_id = driverId` — não há informação visual do profissional no card.
- A imagem do usuário mostra cards de serviço sem avatar; o avatar do perfil aparece só no topo (placeholder “P”).
- `ListaServicosOferecidos` (`src/features/triboservicos/components/lista_servicos_oferecidos.tsx`) é usado em `pagina_perfil_profissional_servicos.tsx`.

## Mudanças

### 1. `lista_servicos_oferecidos.tsx`
- Adicionar prop opcional `profissionalPorServico: Record<string, { nome: string; avatar_url: string | null; is_owner: boolean }>`.
- Em cada card, exibir um pequeno bloco com `Avatar` (24-28px) + nome do profissional logo abaixo do nome do serviço (ou alinhado à esquerda).
- Quando `is_owner=true`, exibir badge sutil "Profissional" (cor primary). Quando afiliado, badge "Equipe".
- Fallback: se mapa não vier ou serviço não tem profissional, não renderiza o bloco (mas ver passo 3 — serviço deve sumir antes).

### 2. `pagina_perfil_profissional_servicos.tsx`
- Como a lista atual só contém serviços do próprio `driverId`, montar o mapa direto:
  ```ts
  const profissionalPorServico = Object.fromEntries(
    dados.serviceTypes.map(s => [s.id, {
      nome: dados.full_name,
      avatar_url: dados.avatar_url,
      is_owner: true,
    }])
  );
  ```
- Passar para `<ListaServicosOferecidos>`.
- Preparado para evolução futura (serviços de afiliados): basta unir mapas.

### 3. Filtrar serviços sem profissional ativo
Em `src/features/passageiro/hooks/hook_dados_servico_motorista.ts` (query de `service_types`):
- Garantir `is_active = true` (verificar se já está) e `driver_id NOT NULL`.
- Antes de retornar `serviceTypes`, validar que o `driver` correspondente existe e está ativo (`drivers.is_active`/`status`); se não, descartar o serviço.

### 4. Esconder a página/CTA quando não sobrar serviço
- Em `pagina_perfil_profissional_servicos.tsx`, recalcular `temServicosPrecificados` após o filtro (já é derivado de `dados.serviceTypes.length`, então fica automático).
- Garantir que o estado vazio de `ListaServicosOferecidos` (“Este profissional ainda não publicou serviços”) seja exibido nesse caso.

## Não faz parte deste plano
- Criar tabela de afiliação serviço↔profissional (a estrutura atual já vincula via `driver_id`; expansão para múltiplos profissionais por serviço pode ser feita depois).
- Mexer no agendamento ou cobrança.

## Arquivos a alterar
- `src/features/triboservicos/components/lista_servicos_oferecidos.tsx`
- `src/features/triboservicos/pages/pagina_perfil_profissional_servicos.tsx`
- `src/features/passageiro/hooks/hook_dados_servico_motorista.ts`
