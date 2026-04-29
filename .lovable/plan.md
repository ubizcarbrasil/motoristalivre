## Plano: finalizar módulo Serviços (TriboServ)

Três frentes, sem mexer em nada do fluxo de Mobilidade existente.

---

### PARTE 1 — `aba_configuracoes.tsx`: integrar seções de Serviços

**Arquivo:** `src/features/painel/components/aba_configuracoes.tsx`

Mudanças:
- Importar `useHookPerfilServico`, `SecaoMeusServicos`, `SecaoMinhaDisponibilidade`.
- Importar `Select` do shadcn e adicionar bloco "Tipo de profissional" com 3 opções: `driver`, `service_provider`, `both`. Ao mudar, executa `UPDATE drivers SET professional_type = ? WHERE id = driverId` e chama `recarregar()` do hook.
- Logo abaixo do select, se `professionalType` for `service_provider` ou `both`:
  - `<Separator />` com label "Módulo Serviços"
  - `<SecaoMeusServicos driverId tenantId servicos={servicos} onAtualizar={recarregar} />`
  - `<SecaoMinhaDisponibilidade driverId tenantId blocos={disponibilidade} onAtualizar={recarregar} />`
- Posicionamento: após o bloco de "Som de chamada" / antes da seção "Grupos e rede".

---

### PARTE 2 — Perfil público do profissional

**`src/features/motorista/types/tipos_perfil_motorista.ts`**
- Adicionar ao `PerfilPublicoMotorista`: `professional_type`, `credential_verified`, `credential_type`, `credential_number`.

**`src/features/motorista/hooks/hook_perfil_motorista.ts`**
- Estender o `select` do driver para incluir os 4 campos novos.
- Após carregar driver, em paralelo:
  - `service_types` WHERE `driver_id = id` AND `is_active = true`
  - `professional_availability` WHERE `driver_id = id` AND `is_active = true`
- Retornar `servicos`, `disponibilidade` no hook.

**`src/features/motorista/pages/pagina_perfil_motorista.tsx`**
- No `<HeaderPerfil>` (ou inline ao lado do nome), se `credential_verified=true`: badge verde "Verificado" com Tooltip mostrando `${credential_type.toUpperCase()} ${credential_number}`. Se o componente `HeaderPerfil` não suportar, passar como prop ou renderizar logo abaixo.
- Se `professional_type` ∈ {`service_provider`, `both`}, abaixo de `<ListaAvaliacoes>` renderizar dois novos componentes:

**Novos componentes:**
- `src/features/motorista/components/secao_servicos_publica.tsx`
  - Lista cards: nome, duração formatada (`Xh Ymin`), preço `R$ x,xx`, badge "Imediato" se `is_immediate`, botão "Agendar" → `navigate(`/${tenant_slug}/${driver_slug}?servico=${id}`)`.
- `src/features/motorista/components/secao_disponibilidade_publica.tsx`
  - Grid 7 dias (Dom–Sáb), cada um com chips `HH:MM–HH:MM` ou traço `—`.

**CTA do botão fixo inferior:**
- Se `professional_type === "service_provider"`: texto vira "Agendar serviço".
- Se `both`: dois botões: "Solicitar corrida" e "Agendar serviço".
- Se `driver`: comportamento atual.
- Todos navegam para `/${tenant_slug}/${driver_slug}` (a bifurcação real ocorre na PARTE 3).

---

### PARTE 3 — Tela de agendamento + bifurcação

**Novo: `src/features/passageiro/components/agendamento_servico.tsx`**

Props:
```ts
{
  driver: { id, full_name, avatar_url, credential_verified, credential_type, tenant_slug, slug },
  tenantId: string,
  serviceTypes: TipoServico[],
  availability: DisponibilidadeProfissional[],
  preSelectedServiceId?: string | null,
}
```

Estrutura interna (componentes locais ou inline):
1. **Header** — avatar, nome, badge Verificado se aplicável, nota média (opcional, vinda de prop futura).
2. **Seleção de serviço** — cards clicáveis; pré-seleciona via `preSelectedServiceId`.
3. **Calendário 14 dias** — gera array de 14 datas a partir de hoje.
   - Para cada data: pega blocos de `availability` com `day_of_week === date.getDay()`.
   - Gera slots `start_time`→`end_time` em passos de `slot_duration_minutes` (+ buffer entre slots).
   - Filtra slots passados (se for hoje).
   - Subtrai conflitos consultando `service_bookings` do driver entre 00:00 e 23:59 do dia, status ∈ {pending, confirmed, in_progress}, considerando duração.
   - Dia sem slots → desabilitado.
4. **Slots do dia selecionado** — botões `HH:MM`.
5. **Identificação cliente (guest)** — inputs Nome e WhatsApp (formato +55…), validação simples. Reusa storage `tribocar_guest_dados` se já existir.
6. **Observações** — `Textarea` opcional.
7. **Forma de pagamento** — `RadioGroup`: `cash` (padrão), `pix`, `card`.
8. **Botão "Confirmar agendamento"** — chama `chamarBookService` com:
   ```ts
   {
     tenant_id, driver_id, service_type_id,
     scheduled_at: ISO, payment_method, notes,
     guest: { full_name, whatsapp }
   }
   ```
   - Erro `409` → `toast.error("Horário já reservado — escolha outro")` e remove slot do estado.
   - Sucesso → tela de confirmação com data/hora/profissional/serviço/valor + botão "Adicionar ao calendário" (`baixarIcs` de `gerador_ics.ts`).

**Lógica de cálculo de slots** — extraída para utilitário:
- `src/features/passageiro/utils/calcular_slots_disponiveis.ts`
  - `gerarSlotsDoDia(date, blocosDoDia, agendamentosDoDia): { hora: string; iso: string }[]`

**Bifurcação em `pagina_passageiro.tsx`**

Hoje a página depende de `useSolicitacao()` que já carrega o motorista. Estratégia: novo hook leve só para descobrir o `professional_type` e dados de serviço sem disparar todo o fluxo de corrida.

- Adicionar carregamento auxiliar (no próprio `useSolicitacao` ou um hook paralelo `useDadosServicoMotorista(driverId)`):
  - Busca `professional_type` do driver atual.
  - Se inclui `service_provider`: carrega `service_types` ativos e `professional_availability` ativos.
- Estado local `modoEscolhido: "ride" | "service" | null` (para `both`).
- Renderização (após `carregando`/`erro`/`tenantSemMotorista`):
  - `professional_type === "service_provider"` → renderiza `<AgendamentoServico .../>` em substituição ao mapa/BottomSheet.
  - `professional_type === "both"`:
    - Se `modoEscolhido === null`: tela inicial leve com botões "Solicitar corrida" / "Agendar serviço" (preserva `?servico=` query — se presente, abre service direto).
    - Se `"ride"`: fluxo atual intacto.
    - Se `"service"`: `<AgendamentoServico />`.
  - `professional_type === "driver"` (default): zero alteração — fluxo atual.
- Ler `useSearchParams` para extrair `?servico=` e passar como `preSelectedServiceId`.

---

### Arquivos a criar
- `src/features/motorista/components/secao_servicos_publica.tsx`
- `src/features/motorista/components/secao_disponibilidade_publica.tsx`
- `src/features/passageiro/components/agendamento_servico.tsx`
- `src/features/passageiro/components/escolha_modo_atendimento.tsx` (botões para `both`)
- `src/features/passageiro/utils/calcular_slots_disponiveis.ts`

### Arquivos a editar
- `src/features/painel/components/aba_configuracoes.tsx`
- `src/features/motorista/types/tipos_perfil_motorista.ts`
- `src/features/motorista/hooks/hook_perfil_motorista.ts`
- `src/features/motorista/pages/pagina_perfil_motorista.tsx`
- `src/features/motorista/components/header_perfil.tsx` (adicionar prop opcional para badge verificado)
- `src/features/passageiro/pages/pagina_passageiro.tsx`

### Não alterar
`dispatch-ride`, `card_dispatch.tsx`, `hook_solicitacao.ts` (apenas leitura de campos extras se necessário, sem mudar fluxo de corrida), `overlay_busca_mapa.tsx`, RLS de Mobilidade, edge `book-service` (já implementada).

### Observações técnicas
- Todos os textos em pt-BR, snake_case nos arquivos, PascalCase nos componentes.
- Reutilizar componentes shadcn existentes (`Card`, `Button`, `Badge`, `Select`, `RadioGroup`, `Tooltip`, `Separator`, `Input`, `Textarea`).
- Dark mode default já garantido pelo design system.
- Usar `supabase.from("service_bookings" as any)` — tipos serão regenerados.