## Objetivo

Criar um chat 1‑a‑1 entre **cliente** (logado ou convidado) e **profissional**, vinculado a cada `service_booking`. Mensagens persistidas no banco com realtime, lidas em tempo real pelos dois lados.

## Modelo de dados

Nova tabela `service_booking_messages`:

```text
id            uuid pk
booking_id    uuid  -> service_bookings(id)
tenant_id     uuid
sender_role   text  ('client' | 'driver')
sender_id     uuid  null  (auth.uid quando logado; null quando guest)
guest_id      uuid  null  (guest_passengers.id quando cliente é convidado)
content       text
read_at       timestamptz null
created_at    timestamptz default now()
```

Índices em `(booking_id, created_at)` e `(booking_id, read_at)`.

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE service_booking_messages;` + `REPLICA IDENTITY FULL`.

### RLS

- **SELECT/INSERT cliente logado**: existe booking onde `client_id = auth.uid()`.
- **SELECT/INSERT profissional**: existe booking onde `driver_id = auth.uid()`.
- **SELECT/INSERT admin do tenant**: leitura por `get_user_role` admin/manager (apenas para auditoria; sem envio).
- **Guest (convidado)**: usa RPC `enviar_mensagem_chat_guest(booking_id, guest_id, content)` e `listar_mensagens_chat_guest(booking_id, guest_id)` (SECURITY DEFINER) que validam que `service_bookings.guest_passenger_id = guest_id`. Sem acesso direto via REST.
- `UPDATE` (marcar lida): apenas o destinatário (cliente/profissional dono do booking).

## Backend (camada feature `chat_servico`)

```
src/features/chat_servico/
├── types/tipos_chat_servico.ts
├── services/servico_chat_servico.ts
├── hooks/hook_chat_servico.ts          (lista + realtime + enviar + marcar lida)
└── components/
    ├── tela_chat_servico.tsx           (full screen, header + lista + input)
    ├── lista_mensagens_chat.tsx
    ├── bolha_mensagem_chat.tsx
    ├── input_chat.tsx
    └── botao_abrir_chat.tsx            (com badge de não-lidas)
```

Reaproveita `BolhaMensagem`/`InputMensagem` de `compartilhados/components/chat` quando viável; cria variantes específicas só onde necessário (papel `client`/`driver` em vez de `passenger`/`driver`).

## Integração na UI

1. **Profissional (painel)**
   - Em `secao_agenda_hoje` / cards de booking (`aba_inicio`): botão "Conversar" abre `TelaChatServico` com badge de não-lidas.
   - Lista de bookings recebe contagem agregada de mensagens não lidas.

2. **Cliente logado**
   - Página de acompanhamento do agendamento (já existente em `passageiro`/`triboservicos`): botão "Conversar com profissional".

3. **Convidado**
   - Após criar booking via `book-service`, retorna `guest_token` (já existe `guest_passenger_id`). A página pública do booking (`/orcamento/:id` ou rota equivalente) ganha o chat usando os RPCs guest.

## Realtime

Hook `hook_chat_servico` assina `postgres_changes` filtrando `booking_id=eq.<id>`. Marca como lida via UPDATE quando a mensagem é renderizada e o usuário é o destinatário.

## Fora de escopo

- Anexos/imagens (apenas texto nesta entrega).
- Notificações push.
- Chat em grupo / equipe.

## Arquivos novos / alterados

**Migration**: tabela + índices + RLS + RPCs guest + publication realtime.

**Novos**:
- `src/features/chat_servico/*` (estrutura acima)

**Alterados**:
- `src/features/painel/components/secao_agenda_hoje.tsx` (botão chat + badge)
- `src/features/painel/components/aba_inicio.tsx` (badge total não-lidas)
- Página de acompanhamento do booking (cliente + guest) — adiciona botão chat.

Após aprovação, implemento na ordem: migration → feature `chat_servico` → integrações nas telas.