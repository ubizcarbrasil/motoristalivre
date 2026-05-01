# Links de acesso e cadastro por perfil

Domínio público: `https://www.motoristalivre.com.br`

## Acesso (login)

| Perfil | URL pública | Comportamento |
|---|---|---|
| Motorista | `/motorista/acesso` | Tela de login com cabeçalho de motorista. Após login → `/painel`. |
| Profissional | `/profissional/acesso` | Tela de login com cabeçalho de profissional. Após login → `/painel`. |
| Administrador geral | `/admin/acesso` | Tela de login restrita. Após login: se `root_admin` → `/root`; senão toast de "sem permissão" e vai para `/painel`. |
| Genérico | `/entrar` | Login padrão; redireciona pelo papel da conta. |

## Cadastro

| Perfil | URL pública |
|---|---|
| Motorista | `/motorista/cadastro` |
| Profissional | `/profissional/cadastro` |
| Genérico (com seletor) | `/cadastro` |

> **Administrador geral não tem cadastro público.** A promoção a `root_admin` é feita manualmente no banco pelo dono do sistema.

## Hub visual

`/acesso` lista todos os links acima em cards organizados por perfil, útil para divulgar e conferir.

## Aliases mantidos para compatibilidade

- `/profissional/login` → `/profissional/acesso`
- `/profissional/entrar` → `/profissional/acesso`
- `/profissional/criar-conta` → `/profissional/cadastro`
- `/cadastrar` → `/cadastro`

## Notas técnicas

- Todas as rotas com `/<perfil>/acesso` e `/<perfil>/cadastro` são `Navigate` para `/entrar?modo=…` e `/cadastro?tipo=…` respectivamente.
- O modo é lido em `pagina_entrar.tsx` via `searchParams.get("modo")`.
- Permissões reais continuam protegidas pelos guards `RotaProtegida` e `RotaProtegidaRoot`.
