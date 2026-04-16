

## Diagnóstico

A tela "Link não encontrado" no print **não é o NotFound 404 genérico** — é a tela de erro do `pagina_passageiro.tsx` (linhas 197–206). Ela é exibida quando o hook `useSolicitacao` seta `erro = true`, o que acontece quando `buscarMotorista(slug, slugPerfil)` retorna `null`.

### Causa raiz: a rota `/demo` cai em `/:slug/:driver_slug` errado

Olhando o `App.tsx`:
```
<Route path="/:slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />
```

Quando o passageiro faz "Login direto" via `/dev/personas`, ele é redirecionado para `/demo`. O `PaginaPassageiro` é montado, e o `useSolicitacao` faz:

```ts
const slugPerfil = params.affiliate_slug || params.driver_slug || "";
// slug = "demo", slugPerfil = ""
if (tipoOrigem === "motorista" && params.slug) {
  const m = await buscarMotorista("demo", "");  // ← driver_slug vazio!
  if (!m) { setErro(true); return; }            // ← cai aqui
}
```

O service `buscarMotorista` faz `.eq("slug", "")` em `drivers`, não acha ninguém, retorna `null`, e a tela mostra "Link não encontrado".

A página `/demo` (sem slug de motorista) **nunca foi pensada para funcionar sozinha** — o fluxo correto é o passageiro abrir um link tipo `/demo/motorista-demo` ou `/demo/a/afiliado-demo`. Sem motorista no path, não há para quem pedir corrida.

### Por que o motorista também não aparece

Mesmo se você acessar `/demo/motorista-demo` direto, pode dar erro porque:
- A edge function `seed-personas` cria o driver com `slug: "motorista-demo"` ✅
- Mas o `useRedirecionamento` manda o passageiro para `/demo` (sem o `/motorista-demo`) ❌

## O que precisa ser corrigido

### 1. Ajustar destino do passageiro nas personas
Em `constantes_personas.ts`, mudar:
```ts
rotaDestino: `/${TENANT_DEMO_SLUG}`           // ❌ /demo
rotaDestino: `/${TENANT_DEMO_SLUG}/motorista-demo`  // ✅ /demo/motorista-demo
```

E também em `hook_redirecionamento.ts`, o caso `passenger` precisa redirecionar para um link válido (tenant + motorista padrão), não só `/demo`.

### 2. Tornar a tela mais amigável quando faltar slug de motorista
Em `pagina_passageiro.tsx`, ao invés de "Link não encontrado" cru, mostrar uma tela de **seleção** ("Escolha um motorista do grupo Demo") listando os motoristas online do tenant, ou pelo menos um link/CTA de volta. Isso evita confundir o usuário em testes.

### 3. Confirmar que o seed roda antes do login
Se o usuário clicou "Login direto" sem antes clicar em "Criar/Recriar personas", o tenant `demo` e o driver `motorista-demo` não existem ainda. Vou adicionar uma checagem no `useRedirecionamento` (ou no `servico_personas`) que dispara o seed automaticamente antes do primeiro login direto, de forma idempotente.

## Arquivos a editar

- `src/features/dev_personas/constants/constantes_personas.ts` — corrigir `rotaDestino` do passageiro para `/demo/motorista-demo`
- `src/features/autenticacao/hooks/hook_redirecionamento.ts` — para `passenger`, buscar um motorista do tenant e redirecionar para `/{tenant_slug}/{