

## Plano

### 1. Passageiro sem cadastro (zero fricção)

**Banco** (migração):
- Criar tabela `guest_passengers` com `id uuid pk`, `tenant_id`, `full_name`, `whatsapp`, `created_at`. Sem RLS de leitura para o público; INSERT permitido para anônimos via RPC.
- Adicionar coluna `guest_passenger_id uuid` em `ride_requests` (nullable). Tornar `passenger_id` nullable. Adicionar CHECK `passenger_id IS NOT NULL OR guest_passenger_id IS NOT NULL`.
- Adicionar coluna `guest_passenger_id` em `rides` (nullable) e relaxar `passenger_id`.
- Criar RPC `create_guest_ride_request(_tenant_id, _full_name, _whatsapp, _origin_*, _dest_*, _distance, _eta, _offered_price, _payment_method, _origin_driver_id, _origin_affiliate_id)` — `SECURITY DEFINER`, cria guest_passenger + ride_request, retorna `ride_request_id` + `guest_passenger_id`.
- Atualizar policy de SELECT em `ride_requests` para permitir leitura pelo guest via `guest_passenger_id` salvo em localStorage (rastreio anônimo via filtro por id).

**Frontend**:
- Remover bloqueio de login em `pagina_passageiro.tsx` (não mostrar mais `BannerLoginNecessario`, não redirecionar em `confirmarCorrida`).
- Criar `dialogo_dados_passageiro.tsx` (popup) que abre ao clicar "Confirmar" se não houver usuário logado: campos **Nome** e **WhatsApp** (com máscara `(11) 99999-9999`).
- Em `hook_solicitacao.ts`, novo fluxo `confirmarCorridaGuest()` chama o RPC, salva `{guest_passenger_id, ride_request_id}` em localStorage para retomar status da corrida.
- Hook `useCorridaAceita` aceita também guest_id e filtra por ele.
- Remover/esconder o botão "Meu perfil" (User icon) no topo quando guest.

### 2. PWA não cortar a tela

- Em `index.html`, atualizar `<meta name="viewport">` para incluir `viewport-fit=cover` (suporte a safe-area do iOS notch).
- Em `index.css`, adicionar utilitário `.safe-area-bottom` com `padding-bottom: env(safe-area-inset-bottom)` e aplicar no `BottomSheet` e botões fixos do passageiro.
- No `BottomSheet`: adicionar `pb-[max(1rem,env(safe-area-inset-bottom))]` no container interno. Header/topo do passageiro: aplicar `pt-[env(safe-area-inset-top)]`.
- Conferir `min-h-screen` → trocar por `min-h-[100dvh]` nas telas full-screen do passageiro (rastreamento, chat, avaliação).

### 3. Botão instalar PWA visível para o cliente

- Criar componente `botao_instalar_pwa.tsx` em `src/features/passageiro/components/`:
  - Captura evento `beforeinstallprompt` (Android/Chrome) e armazena.
  - Detecta iOS Safari e mostra ícone com tooltip de instruções.
  - Esconde se `estaInstalado()` true.
  - Botão flutuante discreto (canto superior direito do passageiro, ao lado do "Meu perfil" quando existir).
- Reaproveitar a página `/instalar` ao tocar no botão se for iOS (mostra instruções nativas).

### 4. Selecionar destino com pino arrastável no mapa

- Criar componente `seletor_local_mapa.tsx`:
  - Abre tela cheia sobre o mapa atual (modal full-screen).
  - Pino central fixo na tela (overlay), o usuário move o **mapa**.
  - Ao parar o movimento (`moveend`), faz reverse-geocoding via Nominatim (`/reverse?lat=&lon=&format=json`) e mostra o endereço resolvido no rodapé.
  - Botão "Confirmar este local" retorna `EnderecoCompleto`.
  - Header com "Definir origem" / "Definir destino" e botão fechar.
- Adicionar serviço `reverseGeocodingNominatim(lat, lng)` em `servico_passageiro.ts`.
- Adicionar botão "Escolher no mapa 📍" abaixo dos campos de endereço em `bottom_sheet.tsx` (etapa endereço), abre o seletor.

### Arquivos editados/criados

**Criar**:
- `supabase/migrations/<ts>_guest_passengers.sql`
- `src/features/passageiro/components/dialogo_dados_passageiro.tsx`
- `src/features/passageiro/components/seletor_local_mapa.tsx`
- `src/features/passageiro/components/botao_instalar_pwa.tsx`
- `src/features/passageiro/hooks/hook_instalar_pwa.ts`
- `src/features/passageiro/utils/mascara_whatsapp.ts`

**Editar**:
- `src/features/passageiro/hooks/hook_solicitacao.ts` — fluxo guest
- `src/features/passageiro/services/servico_passageiro.ts` — reverse geocoding + RPC guest
- `src/features/passageiro/pages/pagina_passageiro.tsx` — remover banner login + integrar novos componentes
- `src/features/passageiro/components/bottom_sheet.tsx` — botão "escolher no mapa"
- `src/features/passageiro/types/tipos_passageiro.ts` — tipo `DadosGuest`
- `src/features/passageiro/hooks/hook_corrida_aceita.ts` — aceitar guest_id
- `index.html` — `viewport-fit=cover`
- `src/index.css` — utilitários safe-area

### Como testar
1. Abrir link de motorista anônimo (sem login) → preencher origem/destino → confirmar → popup pede Nome + WhatsApp → corrida criada
2. Tocar "Escolher no mapa" → arrastar mapa → endereço aparece embaixo → confirmar
3. No iPhone Safari, ver botão "Instalar app" no canto → toca → instruções
4. Conferir que o BottomSheet não fica cortado pelo home indicator do iPhone

