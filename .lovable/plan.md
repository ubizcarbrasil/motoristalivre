

## Diagnóstico — Por que "não consigo acesso na conta do motorista"

Olhando o código, a causa raiz é clara:

**1. Não existe opção "Motorista" no `/cadastro`.** Em `pagina_cadastro.tsx` (linhas 12 e 133-137), as únicas opções são `grupo`, `passageiro` e `afiliado`. Quando alguém abre `/cadastro?tipo=motorista`, o `resolverTipoInicial` cai no default `"grupo"` — ou seja, o usuário acaba criando **um tenant novo** (vira `tenant_admin`), não vira motorista de um grupo existente.

**2. Mesmo se a opção existisse, signup normal não cria o motorista.** O trigger `handle_new_user` insere apenas em `public.users`. Para receber corridas, o usuário precisa também ter linha em `public.drivers` (com slug, veículo, etc.) — coisa que hoje só o `seed-personas` faz (linhas 123-139). Sem isso, `pagina_painel.tsx` mostra "Perfil de motorista não encontrado" (linha 56-66).

**3. Cadastro de motorista deveria precisar de aprovação do dono do grupo.** O modelo correto para um motorista entrar num grupo existente é via `driver_group_invites` (tabela já existe, com `direction = 'request_from_driver'` e status pendente).

## Plano de correção

### Etapa 1 — Adicionar aba "Motorista" no `/cadastro`

Em `pagina_cadastro.tsx`:
- Adicionar `"motorista"` ao tipo `TipoCadastro` e ao array `opcoes` (4 botões em vez de 3).
- `resolverTipoInicial("motorista")` retorna `"motorista"`.
- Quando `tipoCadastro === "motorista"`: exigir slug do grupo, mostrar texto explicativo "Você enviará uma solicitação para entrar no grupo. O dono do grupo precisa aprovar antes de você começar a receber corridas."
- Não setar `metadata.role` (mantém `passenger` default no trigger) — a role só vira `driver` depois da aprovação.
- Após o `signUp` bem-sucedido, criar uma solicitação em `driver_group_invites` (`driver_id = novo user`, `tenant_id = lookup pelo slug`, `direction = 'request_from_driver'`, `status = 'pending'`).

### Etapa 2 — RPC `request_driver_join` (banco)

Como o trigger `handle_new_user` cria a linha em `public.users` com tenant resolvido pelo slug (já faz isso), e `driver_group_invites` exige RLS `(driver_id = auth.uid())`, criar uma função SECURITY DEFINER:

```sql
create or replace function public.request_driver_join(_tenant_slug text, _message text default null)
returns uuid ...
```

A função: resolve `tenant_id` pelo slug, valida que o user já existe em `public.users` no tenant, e insere em `driver_group_invites`.

### Etapa 3 — Aprovação cria o registro em `drivers`

Quando o admin aprova o convite (`status = 'accepted'`), criar trigger ou RPC que:
- Atualiza `users.role = 'driver'`.
- Insere em `public.drivers` com `id = driver_id`, `tenant_id`, `slug` gerado a partir do nome (ex: `joao-silva`), `is_online = false`, `is_verified = false`.
- Motorista pode então logar e cair em `/painel` com perfil válido.

### Etapa 4 — Tela "aguardando aprovação" no painel

Em `pagina_painel.tsx`, quando `perfil` é null mas existe um convite pendente do tipo `request_from_driver` para o user, mostrar tela "Sua solicitação para entrar no grupo X está em análise" em vez de "Perfil de motorista não encontrado".

### Etapa 5 — Atualizar links externos

URLs corretos para divulgar (após DNS de `turbo.tribocar.com` ser configurado, ou usando `motoristalivre.lovable.app`):
- Motorista entrar num grupo: `/cadastro?tipo=motorista`
- Passageiro: `/cadastro?tipo=passageiro`
- Afiliado: `/cadastro?tipo=afiliado`
- Criar grupo novo: `/cadastro` (default)

## Arquivos que serão tocados

- `src/features/autenticacao/pages/pagina_cadastro.tsx` — adicionar aba motorista, fluxo de solicitação.
- Nova migration SQL — função `request_driver_join` + trigger/função `approve_driver_invite` que cria linha em `drivers`.
- `src/features/painel/pages/pagina_painel.tsx` + hook — detectar e mostrar estado "aguardando aprovação".
- (Opcional) `src/features/admin/components/secao_motoristas.tsx` — garantir que a UI de aprovação já existe e funciona com `request_from_driver`.

## Resumo

Hoje, **literalmente não há caminho de signup para virar motorista de um grupo**. A pessoa que tenta `?tipo=motorista` vira `tenant_admin` por engano. O plano cria esse caminho do zero, com aprovação do dono do grupo, e devolve feedback claro pro motorista enquanto espera.

<lov-actions>
<lov-suggestion message="Aprovar o plano completo: aba Motorista no /cadastro, RPC request_driver_join, fluxo de aprovação criando linha em drivers, e tela 'aguardando aprovação' no painel">Implementar plano completo</lov-suggestion>
<lov-suggestion message="Implementar apenas a etapa 1 e 2 (aba Motorista no cadastro + RPC request_driver_join), deixar aprovação manual via SQL por enquanto">Só cadastro + solicitação</lov-suggestion>
<lov-suggestion message="Em vez de fluxo com aprovação, faça o /cadastro?tipo=motorista criar o motorista direto (role=driver + linha em drivers com slug auto-gerado), sem precisar de aprovação do dono do grupo">Cadastro direto sem aprovação</lov-suggestion>
</lov-actions>
