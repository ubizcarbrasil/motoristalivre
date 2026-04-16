

## Achei a causa raiz exata

O passageiro NÃO consegue solicitar corrida porque o **INSERT na tabela `ride_requests` quebra dentro de um trigger do banco**.

### O que está acontecendo na hora do "Confirmar":

1. App chama `ensure_passenger(tenant_id)` — funciona, cria a linha em `passengers` se faltar.
2. App tenta `INSERT INTO ride_requests (...)` com seus dados.
3. O trigger `trigger_dispatch_ride` dispara automaticamente e chama a função `notify_dispatch_ride()`.
4. Essa função tenta executar `extensions.http_post(...)` — e essa função **NÃO EXISTE** no banco.
5. O Postgres aborta a transação inteira → o INSERT falha → o app mostra "Erro ao solicitar corrida".

### Por que isso só aparece agora:

A extensão `pg_net` está instalada, mas ela cria a função no schema `net` (`net.http_post`), não em `extensions.http_post`. A migração `20260416030831` foi escrita assumindo o schema errado. O trigger continuou de pé, e toda solicitação de corrida cai nesse erro silencioso.

Confirmações que validei direto no banco:
- `pg_extension` → só tem `pg_net` (não tem `http`).
- `pg_proc` → `http_post` existe APENAS no schema `net`.
- Trigger `trigger_dispatch_ride` está ativo em `ride_requests`.
- Nenhum `ride_request` novo foi criado depois da migração de despacho (só os 8 do seed).

### Diagnóstico secundário (não é o erro atual, mas evita confusão depois):

Você está logado como `alecio@ubizcar.com.br`, que é `tenant_admin` do grupo **papalegua**, mas está pedindo corrida em `motoristalivre.lovable.app/demo/motorista-demo` (tenant **demo**). Isso é OK pelo schema — vira passageiro em `demo` automaticamente. Só fica claro que você está testando como passageiro do tenant errado em relação ao seu papel administrativo.

## Plano de correção

### 1. Corrigir a função `notify_dispatch_ride` (migração SQL)

Trocar `extensions.http_post` por `net.http_post` (chamada correta do `pg_net`). Manter o resto idêntico — fallback de URL, headers, payload.

```sql
CREATE OR REPLACE FUNCTION public.notify_dispatch_ride()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  IF NEW.status = 'pending' THEN
    _url := 'https://sulhoaufaifqgnrvstez.supabase.co/functions/v1/dispatch-ride';
    _anon_key := current_setting('app.settings.supabase_anon_key', true);

    PERFORM net.http_post(
      url := _url,
      body := jsonb_build_object(
        'action', 'trigger',
        'record', jsonb_build_object(
          'id', NEW.id,
          'tenant_id', NEW.tenant_id,
          'passenger_id', NEW.passenger_id,
          'origin_driver_id', NEW.origin_driver_id,
          'origin_affiliate_id', NEW.origin_affiliate_id,
          'status', NEW.status
        )
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(_anon_key, '')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;
```

### 2. Blindar o trigger contra falhas de rede futuras

Envolver a chamada `net.http_post` em `BEGIN ... EXCEPTION WHEN OTHERS THEN ... END` para que, se o pg_net falhar por qualquer motivo, **a corrida seja salva mesmo assim** e só registre log. Assim o passageiro nunca mais fica preso por causa do despacho.

### 3. Melhorar a mensagem de erro no app (1 ajuste em `hook_solicitacao.ts`)

Hoje o toast só diz "Erro ao solicitar corrida". Vou incluir o `code` do erro Postgres quando vier do Supabase, pra erros futuros aparecerem com pistas (ex: `42883 function … does not exist`).

### 4. Teste end-to-end depois da correção

Você abre `motoristalivre.lovable.app/demo/motorista-demo`, define origem/destino, escolhe veículo, confirma. Deve cair na tela "Buscando motoristas". Como o `motorista@tribocar.test` está online no tenant demo, o dispatch dispara e ele recebe a notificação.

## Resultado esperado

- Solicitar corrida funciona em qualquer tenant para qualquer usuário logado.
- Falha futura no pg_net não trava mais o passageiro.
- Erros de banco aparecem com código no toast pra debug rápido.

<lov-actions>
<lov-suggestion message="Aplique o plano: corrija a função notify_dispatch_ride trocando extensions.http_post por net.http_post, envolva a chamada em EXCEPTION WHEN OTHERS pra falha de rede não travar a inserção, e ajuste o hook_solicitacao.ts pra mostrar o código do erro Postgres no toast">Aplicar correção do trigger</lov-suggestion>
