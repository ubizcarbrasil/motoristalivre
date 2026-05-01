
# Links dedicados de acesso e cadastro por perfil

## Situação atual

- `/entrar` único para todos, com `?modo=` como variação.
- `/cadastro` único, com `?tipo=` para diferenciar.
- Para profissional já existem aliases (`/profissional/login`, `/profissional/cadastro`) que redirecionam.
- Não há link próprio para motorista nem para administrador geral (root).

Faltam URLs limpas e memorizáveis por perfil, separando claramente **acesso** (login) de **cadastro**.

## URLs finais propostas

### Acesso (login)
| Perfil | URL pública | Comportamento |
|---|---|---|
| Motorista | `/motorista/acesso` | Abre `/entrar` no modo motorista |
| Profissional | `/profissional/acesso` | Abre `/entrar` no modo profissional |
| Administrador geral (root) | `/admin/acesso` | Abre `/entrar` no modo admin; após login, vai para `/root` se for `root_admin`, senão `/painel` |

### Cadastro
| Perfil | URL pública |
|---|---|
| Motorista | `/motorista/cadastro` → `PaginaCadastro` com `tipo=motorista` |
| Profissional | `/profissional/cadastro` → `PaginaCadastroProfissional` (`/s/cadastro/profissional`) |

Administrador geral **não tem cadastro público** — promoção é manual via banco. Deixar isso explícito na página de acesso admin.

### Aliases mantidos (compatibilidade)
- `/entrar`, `/cadastro` continuam funcionando (genéricos).
- `/profissional/login`, `/profissional/entrar`, `/profissional/criar-conta` redirecionam para os novos.

## Implementação

### 1. Novas rotas em `src/App.tsx`
Adicionar:
```
/motorista/acesso     → Navigate /entrar?modo=motorista
/motorista/cadastro   → Navigate /cadastro?tipo=motorista
/profissional/acesso  → Navigate /entrar?modo=profissional
/admin/acesso         → Navigate /entrar?modo=admin
```
Manter os redirects antigos.

### 2. Suportar `modo=motorista` e `modo=admin` em `PaginaEntrar`
- Editar `src/features/autenticacao/pages/pagina_entrar.tsx`:
  - Ler `searchParams.get("modo")`.
  - Ajustar título/subtítulo: "Acesso do motorista" / "Acesso do profissional" / "Acesso administrativo".
  - Para `modo=admin`: após login bem-sucedido, consultar `users.role`; se `root_admin` → `navigate("/root")`, senão mostrar mensagem "Conta sem permissão administrativa" e redirecionar para `/painel`.
  - Para `modo=motorista` e `modo=profissional`: após login → `/painel`.

### 3. Suportar `tipo=motorista` em `PaginaCadastro`
Verificar `src/features/autenticacao/pages/pagina_cadastro.tsx`:
- Garantir branch para `tipo=motorista` (formulário/labels específicos do motorista).
- Se `tipo=profissional`, manter redirect para `/s/cadastro/profissional` (já existe).

### 4. Página de hub de acesso (opcional, recomendado)
- Substituir/atualizar `src/pages/pagina_acesso.tsx` (rota `/acesso`) para listar visualmente os 3 acessos + 2 cadastros, servindo como índice navegável e fácil de compartilhar.
- Cards: "Sou Motorista", "Sou Profissional", "Sou Administrador", com botões "Entrar" e "Criar conta" (admin sem cadastro).

### 5. Documentação
- Criar `docs/links_acesso.md` com a tabela final dos links para o time guardar.

## Arquivos previstos

Editar:
- `src/App.tsx` — novas rotas.
- `src/features/autenticacao/pages/pagina_entrar.tsx` — modos `motorista` e `admin` + redirect pós-login por role.
- `src/features/autenticacao/pages/pagina_cadastro.tsx` — confirmar branch `tipo=motorista`.
- `src/pages/pagina_acesso.tsx` — hub visual com os 5 links.

Criar:
- `docs/links_acesso.md`.

Nenhuma alteração de banco. Nenhuma mudança de RLS. As permissões reais continuam protegidas pelos guards existentes (`RotaProtegida`, `RotaProtegidaRoot`).

## Resultado para o usuário

Links finais para divulgar:

- Motorista: `motoristalivre.com.br/motorista/acesso` e `/motorista/cadastro`
- Profissional: `motoristalivre.com.br/profissional/acesso` e `/profissional/cadastro`
- Administrador: `motoristalivre.com.br/admin/acesso` (só você acessa de fato)
- Hub: `motoristalivre.com.br/acesso` (página com todos os botões)
