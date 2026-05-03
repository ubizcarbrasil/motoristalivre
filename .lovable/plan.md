## Objetivo

Quando o usuário acessar `/cadastro?tipo=profissional` (e variações como `/cadastrar?tipo=profissional`), redirecionar automaticamente para o fluxo dedicado `/s/cadastro/profissional`, mantendo os demais valores de `?tipo=` (motorista, passageiro, etc.) no comportamento atual.

## Mudanças

### 1. Novo componente wrapper

Criar `src/features/autenticacao/components/redirect_cadastro_por_tipo.tsx`:

- Lê `searchParams.get("tipo")` via `useSearchParams`.
- Se `tipo === "profissional"`, retorna `<Navigate to="/s/cadastro/profissional" replace />`.
- Caso contrário, renderiza `<PaginaCadastro />` normalmente.

### 2. Atualizar `src/App.tsx`

Trocar as duas rotas:

```
<Route path="/cadastro" element={<PaginaCadastro />} />
<Route path="/cadastrar" element={<PaginaCadastro />} />
```

por:

```
<Route path="/cadastro" element={<RedirectCadastroPorTipo />} />
<Route path="/cadastrar" element={<RedirectCadastroPorTipo />} />
```

Adicionar o import correspondente.

## Resultado

- `/cadastro?tipo=profissional` → redireciona pra `/s/cadastro/profissional` (fluxo TriboServiços completo).
- `/cadastro?tipo=motorista` → continua na `PaginaCadastro` atual.
- `/cadastro` (sem `tipo`) → continua na `PaginaCadastro` atual.
- Rotas já existentes (`/profissional/cadastro`, `/cadastro/profissional`) continuam funcionando, agora com mais um caminho equivalente.

Nenhuma mudança em backend, schema ou componentes existentes.
