

## Diagnóstico

O usuário (dono de tribo sem perfil de motorista) está no painel unificado mas **não consegue ficar online** pra receber corridas. Olhando o código:

- `pagina_painel.tsx`: quando `podeAcessarComoDono` é true (dono sem perfil de motorista), renderiza só `AbaTribo` / `AbaCarteira` / `AbaConfiguracoes` — **não tem o toggle "Online"** nem a aba "Início" com `HeaderPainel` que contém o botão de online.
- O toggle online vive em `header_painel.tsx` e depende de `perfil` (PerfilMotorista) — que não existe pro dono sem driver.
- Sem perfil em `drivers`, o usuário não pode receber dispatch (a tabela `drivers` é o que define quem está online e recebe corridas).

## Solução

Criar automaticamente o **perfil de motorista** pro dono da tribo quando ele quiser ficar online. Isso resolve o caso "dono também dirige" sem fricção.

### O que vou fazer

**1. Botão "Começar a receber corridas" na aba Tribo (quando dono sem perfil driver)**
- Card destacado no topo da `AbaTribo` quando `!perfil && podeAcessarComoDono`
- Texto: "Você é dono desta tribo. Quer também receber corridas como motorista?"
- Botão "Ativar modo motorista" → cria registro em `public.drivers` com o `id` do usuário e `tenant_id` da tribo selecionada

**2. Função SQL `ensure_driver_profile(_tenant_id uuid)`**
- SECURITY DEFINER
- Verifica se já existe driver com `id = auth.uid()` no tenant
- Se não, gera slug com `generate_driver_slug()` e insere em `drivers` com `is_online = false`, `is_verified = true` (dono é auto-verificado)
- Atualiza `users.role` pra `'driver'` se ainda for `passenger`
- Retorna o id do driver criado/existente

**3. Após ativar, recarregar painel**
- Chama `recarregar()` do hook
- Agora `perfil` existe → renderiza `AbaInicio` normal com `HeaderPainel` + toggle online + recebe dispatch

**4. Fluxo completo do usuário**
1. Dono entra no `/painel` → vê aba Tribo com card "Ativar modo motorista"
2. Clica → cria perfil driver automaticamente → painel recarrega
3. Agora tem aba "Início" com toggle online → fica online → recebe dispatch da própria tribo

## Arquivos editados

**Migração SQL** (nova função):
- `ensure_driver_profile(_tenant_id uuid)` — cria perfil driver pro próprio user na tribo informada

**Novo componente**:
- `src/features/painel/components/card_ativar_motorista.tsx` — card com botão de ativação

**Modificados**:
- `src/features/painel/services/servico_painel.ts` — adicionar `ativarModoMotorista(tenantId)` que chama RPC
- `src/features/painel/components/aba_tribo.tsx` — incluir `<CardAtivarMotorista />` no topo quando `semPerfilDriver`
- `src/features/painel/pages/pagina_painel.tsx` — passar prop `semPerfilDriver` + callback `onAtivado` (chama recarregar)
- `src/features/painel/hooks/hook_painel.ts` — expor `recarregar` (já existe como `recarregar`)

## Bug paralelo (warning no console)

Vi no log um warning de `Function components cannot be given refs` em `secao_regras.tsx` → `Select`. Vou aproveitar e corrigir trocando o componente filho do `Select` pra usar `forwardRef` ou ajustar a composição. **Não bloqueia** o fluxo, mas limpa o console.

## Como testar

1. Logar como dono de tribo (sem perfil driver) → entra no `/painel`
2. Aba "Tribo" mostra card no topo: **"Ativar modo motorista"**
3. Clicar no botão → toast de sucesso → painel recarrega
4. Aparece aba "Início" → toggle "Online" no header → ativar
5. Aguardar uma corrida da própria tribo (ou usar simulador) → recebe dispatch
6. Aceitar → fluxo completo de corrida funciona

