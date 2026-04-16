

O usuário quer ter credenciais de teste (email + senha) para cada tipo de persona do sistema (root_admin, tenant_admin, manager, driver, affiliate, passenger) para conseguir testar todos os fluxos.

Olhando o schema, o enum `app_role` aparece em vários lugares e os papéis identificados são:
- `root_admin` → super admin da plataforma (`/root`)
- `tenant_admin` → dono do grupo (`/admin`)
- `manager` → gestor do grupo (`/admin`)
- `driver` → motorista (`/painel`)
- `affiliate` → afiliado (`/afiliado`)
- `passenger` → passageiro (`/:slug`)

Não dá pra criar usuários no `auth.users` via migration SQL diretamente de forma confiável (precisa de hash de senha do GoTrue). A forma correta é usar uma **edge function** com `SUPABASE_SERVICE_ROLE_KEY` chamando `supabase.auth.admin.createUser`, e depois inserir na tabela `public.users` com o role correto + tenant_id.

Plano enxuto: criar um seed de personas via edge function que o usuário pode disparar uma vez, e entregar as credenciais em uma página interna (ou só no chat). Vou propor entregar via edge function + página `/dev/personas` protegida só pra ele ver as senhas durante teste.

# Plano: Criar usuários de teste para todas as personas

## O que vai ser feito

Criar **6 usuários de teste** (um para cada papel) com email/senha previsíveis, cada um já vinculado a um tenant de demonstração, para você poder logar e testar cada fluxo do sistema.

## Personas e ordem de grandeza (do mais poderoso ao mais restrito)

| Nível | Persona | Role no banco | Email | Rota após login |
|---|---|---|---|---|
| 1 | Super Admin da plataforma | `root_admin` | `root@tribocar.test` | `/root` |
| 2 | Dono do grupo (tenant) | `tenant_admin` | `admin@tribocar.test` | `/admin` |
| 3 | Gestor do grupo | `manager` | `manager@tribocar.test` | `/admin` |
| 4 | Motorista | `driver` | `motorista@tribocar.test` | `/painel` |
| 5 | Afiliado | `affiliate` | `afiliado@tribocar.test` | `/afiliado` |
| 6 | Passageiro | `passenger` | `passageiro@tribocar.test` | `/demo` (slug do tenant) |

**Senha única para todos:** `Tribo@2025` (fácil de lembrar durante testes).

## Como implementar

### 1. Edge function `seed-personas` (one-shot)
- Usa `SUPABASE_SERVICE_ROLE_KEY` para chamar `auth.admin.createUser` com `email_confirm: true` (sem precisar verificar email).
- Para cada persona: cria o usuário no `auth.users`, depois insere em `public.users` com o `role` correto.
- Garante que existe um tenant `demo` (slug: `demo`) e popula:
  - `tenant_branding` com cor primária e nome
  - `tenant_settings` padrão
  - linha em `drivers` para o motorista (com slug, veículo)
  - linha em `affiliates` para o afiliado (aprovado)
  - linha em `passengers` para o passageiro
- **Idempotente**: se o email já existe, pula a criação (pode rodar várias vezes sem erro).
- `verify_jwt = false` para você conseguir disparar uma vez sem estar logado.

### 2. Página interna `/dev/personas`
Tela simples, pública, que mostra:
- Lista das 6 personas com email + senha + rota de destino
- Botão **"Criar/Recriar personas"** que dispara a edge function
- Botão **"Copiar credenciais"** ao lado de cada uma
- Botão **"Login direto"** que já preenche e entra com aquela persona

Assim você abre `/dev/personas`, clica em "Criar", e tem todos os logins na mão.

## Arquivos que vou criar

- `supabase/functions/seed-personas/index.ts` — cria os 6 usuários + tenant demo + dados relacionados
- `supabase/config.toml` — adiciona `[functions.seed-personas]` com `verify_jwt = false`
- `src/features/dev_personas/types/tipos_personas.ts`
- `src/features/dev_personas/constants/constantes_personas.ts` — lista das 6 personas
- `src/features/dev_personas/services/servico_personas.ts` — chama a edge function + login direto
- `src/features/dev_personas/components/card_persona.tsx` — card com email/senha/botões
- `src/features/dev_personas/hooks/hook_personas.ts`
- `src/features/dev_personas/pages/pagina_personas.tsx`
- `src/App.tsx` — adicionar rota pública `/dev/personas`

## Observação de segurança

Esta página `/dev/personas` é **pública** porque é só pra ambiente de teste. Antes de publicar em produção, basta remover a rota do `App.tsx` e a edge function. Posso colocar um aviso visual amarelo no topo da tela: *"Apenas para testes. Remover antes de publicar."*

## O que você terá ao final

1. Acessa `https://...lovable.app/dev/personas`
2. Clica em **"Criar personas"** (uma vez só)
3. Vê os 6 cards com login/senha de cada papel
4. Clica em **"Login direto"** em qualquer um e entra direto na rota correta
5. Pode testar fluxo completo: pede corrida como passageiro, aceita como motorista, confere comissão como admin, etc.

