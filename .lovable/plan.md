

## Diagnóstico: por que a corrida não chama no app do motorista

Encontrei **3 bugs encadeados** que explicam o problema:

### 1. Trigger ausente em `ride_requests` (CAUSA RAIZ)
A função `notify_dispatch_ride()` existe no banco, mas **não há TRIGGER attached** na tabela `ride_requests`. Resultado: quando o passageiro cria a corrida, **nada** chama a edge function `dispatch-ride`. Confirmado via `information_schema.triggers` (0 linhas).

### 2. Enum `dispatch_mode` não bate com a edge function
O enum no banco tem valores `auto | manual | hybrid`, mas o código da edge function compara contra `owner_priority | proximity | broadcast`. O tenant Papa-léguas está em `dispatch_mode='manual'` → mesmo se a edge rodar, cai no `else` (trata como broadcast). Não quebra, mas é frágil e errado semanticamente.

### 3. Enum `dispatch_response` na edge function
A edge usa response `'rejected'` mas o enum aceita `'rejected'` ✓. OK aqui.

### Confirmação dos fatos
- Última corrida criada (`2356b03f...`) ficou `cancelled` sem nenhum dispatch novo.
- Corridas seed antigas (`6b2910d6...`) só funcionaram porque foram criadas via testes manuais com chamada direta da edge.
- Driver Alecio (`548af796`) está online no tenant Papa-léguas — o problema não é falta de motorista.

---

## Plano de correção

### A. Criar o trigger faltante
Migração SQL nova: `CREATE TRIGGER trg_notify_dispatch_ride AFTER INSERT ON public.ride_requests FOR EACH ROW EXECUTE FUNCTION public.notify_dispatch_ride();`

### B. Garantir que o anon key esteja disponível para `net.http_post`
A função usa `current_setting('app.settings.supabase_anon_key', true)`. Se vier vazio, o POST vai sem auth e a edge rejeita. **Solução robusta**: hardcodar o anon key na função (já temos hardcoded a URL) OU usar o service_role via `vault`. Vou hardcodar o anon key na função `notify_dispatch_ride` (mesma migração) — é informação pública, sem risco.

### C. Corrigir o `dispatch_mode` na edge function
Atualizar `supabase/functions/dispatch-ride/index.ts` para mapear os valores corretos do enum:
- `auto` → comportamento de owner_priority (tenta dono primeiro, depois sequencial)
- `manual` → broadcast (todos online recebem ao mesmo tempo) — combina com seu fluxo atual onde o motorista aceita manualmente
- `hybrid` → owner_priority por X segundos, depois broadcast

### D. Adicionar log + fallback no app do passageiro
Se passados 5 segundos após criar a corrida e ela ainda estiver com `status='pending'` (sem virar `dispatching`), o frontend chama explicitamente a edge function `dispatch-ride` com `action: 'dispatch'` como fallback. Isso garante funcionamento mesmo se o trigger falhar de novo no futuro.

### E. Suportar passageiro guest no fluxo `accept`
A função `handleDriverResponse` faz `INSERT INTO rides ... passenger_id: request.passenger_id`. Quando a corrida é guest, `passenger_id` é null e o insert vai falhar a constraint a menos que repassemos `guest_passenger_id`. Vou ajustar a edge para incluir `guest_passenger_id: request.guest_passenger_id` no insert de `rides`.

### Arquivos
- **Nova migração**: cria trigger + atualiza `notify_dispatch_ride` com anon key hardcoded.
- **Editar** `supabase/functions/dispatch-ride/index.ts`: mapeamento de modes correto + suporte guest no accept.
- **Editar** `src/features/passageiro/hooks/hook_solicitacao.ts`: fallback que chama `supabase.functions.invoke('dispatch-ride', { action: 'dispatch', ride_request_id })` 5s após criar a corrida se ainda estiver `pending`.

### Como testar
1. Abrir o link de motorista, sem login, criar uma corrida.
2. Ver o motorista (Alecio) receber alerta sonoro + popup de chamada na tela `/painel`.
3. Verificar via SQL: `SELECT status FROM ride_requests ORDER BY created_at DESC LIMIT 1` → deve virar `dispatching`.
4. Aceitar no app do motorista → corrida vira `accepted`, passageiro vê tela "motorista a caminho".

