## Problema

O link `https://motoristalivre.lovable.app/@alecio-cavalcante` (e equivalente no preview) mostra **"Link não encontrado"**.

### Diagnóstico

1. ✅ O handle existe no banco: `resolve_handle('alecio-cavalcante')` retorna `tenant_slug=papalegua`, `driver_slug=alecio-cavalcante`.
2. ✅ A função RPC tem permissão para `anon`.
3. ❌ A rota `/@:handle` no `App.tsx` **não está casando** o request. Em vez disso, a rota catch-all `/:slug` captura o path inteiro e o `ResolverPublicoTenant` busca um tenant com slug `@alecio-cavalcante`, não acha, e o `PaginaPassageiro` renderiza a mensagem "Link não encontrado / Verifique se o endereço está correto" (linhas 267-276 de `pagina_passageiro.tsx`).

A causa raiz é que navegadores e clients HTTP frequentemente codificam o `@` como `%40` na URL, e o template `/@:handle` do React Router não casa com `/%40alecio-cavalcante`. Resultado: a rota mais genérica `/:slug` ganha.

## Solução

Tornar a resolução de `@handle` resiliente a encoding e a qualquer ambiguidade de matching, em duas frentes:

### 1. `App.tsx` — adicionar variantes da rota

Adicionar rota explícita também para a forma percent-encoded e para handle posicionado como primeiro segmento:

```tsx
<Route path="/@:handle" element={<PaginaResolverHandle />} />
<Route path="/%40:handle" element={<PaginaResolverHandle />} />
```

### 2. `ResolverPublicoTenant` — interceptar slugs que começam com `@`

No início do `useEffect`, antes de consultar `tenants`, detectar se o `slug` começa com `@` (após `decodeURIComponent`). Se sim, redirecionar internamente para `/@<resto>` via `<Navigate>` para que `PaginaResolverHandle` assuma. Isso fecha qualquer brecha caso o React Router ainda priorize `/:slug`.

```ts
const slugDecodificado = decodeURIComponent(slug ?? "");
if (slugDecodificado.startsWith("@")) {
  setEstado("redirecionar_handle");
  return;
}
// ... resto da lógica atual
```

E no render:
```tsx
if (estado === "redirecionar_handle") {
  return <Navigate to={`/${slugDecodificado}`} replace />;
}
```
(ou redirecionar direto para `/s/...` chamando `resolverHandle` ali mesmo, evitando uma navegação extra)

### 3. `PaginaResolverHandle` — robustez na leitura do param

Aplicar `decodeURIComponent` no `handle` e remover qualquer `@` residual antes de chamar `resolverHandle()`. Já existe `replace(/^@/, "")` no service, mas adicionar decode no componente protege contra `%40` duplicado.

### 4. Republicação

Após o fix, **republicar o site** para que `motoristalivre.lovable.app` e o domínio customizado `www.motoristalivre.com.br` recebam a versão com a Fase 6 + correção. O preview privado `lovableproject.com` exige login no Lovable e **não deve ser compartilhado com clientes** — vou reforçar isso na resposta.

## Arquivos afetados

- `src/App.tsx` — adicionar rota `/%40:handle`
- `src/features/passageiro/components/resolver_publico_tenant.tsx` — interceptar slugs com `@`
- `src/features/triboservicos/pages/pagina_resolver_handle.tsx` — `decodeURIComponent` no param

## Validação

1. Acessar `/@alecio-cavalcante` → deve redirecionar para `/s/papalegua/alecio-cavalcante`.
2. Acessar `/%40alecio-cavalcante` → mesmo comportamento.
3. Acessar `/handle-inexistente` (com `@`) → cai no NotFound canônico, não em "Link não encontrado" do passageiro.
4. Rotas existentes `/papalegua`, `/s/papalegua/alecio-cavalcante` continuam funcionando.