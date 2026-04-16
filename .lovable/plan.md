
## Diagnóstico

A tela que você está vendo (`/admin`) está **correta para o seu papel atual** — você é `tenant_admin` do grupo "turbo". O `hook_redirecionamento.ts` te manda pro `/admin` automaticamente porque é onde admins trabalham.

Pra testar o fluxo de **receber corridas**, você precisa estar logado como uma conta com role `driver`. Você tem 3 caminhos possíveis:

## Opções pra desbloquear o teste

**Opção A — Logar com motorista demo existente**
As contas `carlos-silva` e `ana-souza` já existem no banco (criadas pelo `seed-personas`). Preciso descobrir/resetar a senha delas via SQL e te passar pra você logar em outro navegador/aba anônima.

**Opção B — Criar página /dev/personas (recomendado)**
Já existe a feature `dev_personas` no projeto (`src/features/dev_personas/`). Vou verificar se ela tem botão "Logar como" funcional. Se sim, é só te indicar a rota. Se não, implemento.

**Opção C — Criar uma segunda conta sua de motorista**
Você cria outro email (ex: `valquiria+motorista@...`), cadastra em `/cadastro?tipo=motorista` com slug `turbo`, depois loga como admin no `valquiria.ubizcar@gmail.com`, vai em `/admin → Motoristas`, aprova a solicitação. Aí loga com o segundo email e cai em `/painel`.

## Plano sugerido

1. **Verificar a feature `dev_personas`** — ler `pagina_personas.tsx` e `hook_personas.ts` pra ver se já existe troca rápida funcional.
2. **Se existir e funcionar**: te passar a URL e a senha padrão das personas demo.
3. **Se não existir/funcionar**: implementar botão "Logar como" usando admin API ou senha fixa demo (`tribocar123` por exemplo) pra trocar entre contas em 1 clique durante testes.
4. **Documentar no chat**: deixar claro que `/admin` ≠ `/painel` e que cada papel tem sua tela.

## Resumo curto

Sim, a tela de `/admin` está certa pra quem é admin do grupo. **Não é bug.** Pra ver a tela de receber corridas (`/painel`), precisa logar com conta de motorista. Recomendo eu finalizar a `/dev/personas` pra você alternar entre admin/motorista/passageiro/afiliado em 1 clique durante os testes.

<lov-actions>
<lov-suggestion message="Verifique a feature dev_personas existente e finalize a página /dev/personas com botão 'Logar como' funcional pra eu trocar entre admin/motorista/passageiro/afiliado em 1 clique durante testes. Use uma senha demo fixa tipo 'tribocar123' pra todas as personas.">Finalizar /dev/personas com troca rápida</lov-suggestion>
<lov-suggestion message="Reseta a senha das contas demo carlos-silva@tribocar.test e ana-souza@tribocar.test pra 'tribocar123' via SQL e me passa o email pra eu logar em aba anônima e testar o /painel">Resetar senha das contas demo</lov-suggestion>
<lov-suggestion message="Adicione no /admin um botão 'Visualizar como motorista' que faça login impersonado em uma das contas de motorista do grupo só pra fins de teste/preview, sem perder a sessão admin">Botão 'Visualizar como motorista'</lov-suggestion>
</lov-actions><lov-plan>

## Diagnóstico

A tela `/admin` que você está vendo **está correta** — você é `tenant_admin` do grupo "turbo" e o `hook_redirecionamento.ts` te leva pra lá automaticamente. Não é bug.

`/admin` ≠ `/painel`. São papéis diferentes:

| Papel | Rota | Função |
|---|---|---|
| `tenant_admin` (você) | `/admin` | Gerencia grupo, aprova motoristas |
| `driver` | `/painel` | Recebe e aceita corridas |

Uma mesma conta **não pode ser admin e motorista ao mesmo tempo** (role é única). Pra testar receber corridas, precisa logar com outra conta.

## Caminho recomendado

A feature `dev_personas` já existe no projeto (`src/features/dev_personas/`). Vou:

1. **Auditar** o que já está implementado em `pagina_personas.tsx`, `hook_personas.ts` e `servico_personas.ts`.
2. **Garantir que a rota `/dev/personas`** está registrada no `App.tsx` e acessível.
3. **Implementar/corrigir o botão "Logar como"** pra trocar entre as personas demo (`carlos-silva`, `ana-souza`, admins, passageiros, afiliados) em 1 clique, usando senha demo fixa (ex: `tribocar123`).
4. **Garantir que as senhas demo estão setadas** no `seed-personas` ou via SQL pra todas as contas demo terem a mesma senha conhecida.
5. **Te passar a URL final** (ex: `motoristalivre.lovable.app/dev/personas`) pra você trocar de papel rapidinho durante testes.

## Resultado esperado

Você abre `/dev/personas`, vê uma lista de cards (Admin Turbo, Carlos Silva motorista, Ana Souza motorista, passageiro demo, afiliado Posto Shell), clica em "Logar como Carlos Silva" → cai direto no `/painel` como motorista, fica online, e pode receber dispatch.

## Alternativa mais rápida (se preferir)

Se não quiser mexer na `/dev/personas` agora, eu só reseto a senha de `carlos-silva@tribocar.test` pra `tribocar123` via SQL, você abre uma aba anônima, loga com esse email, e cai no `/painel`.

<lov-actions>
<lov-suggestion message="Finalize a página /dev/personas com botão 'Logar como' funcional usando senha demo fixa 'tribocar123' pra eu trocar entre admin/motorista/passageiro/afiliado em 1 clique. Garanta que a rota está registrada no App.tsx e que todas as contas demo têm essa senha setada via SQL.">Finalizar /dev/personas com troca rápida</lov-suggestion>
<lov-suggestion message="Reseta a senha das contas demo carlos-silva@tribocar.test e ana-souza@tribocar.test pra 'tribocar123' via SQL e me confirma os emails pra eu logar em aba anônima e testar o /painel direto">Só resetar senha das contas demo</lov-suggestion>
<lov-suggestion message="Adicione no /admin um card 'Modo demonstração' com botões 'Ver como motorista Carlos' e 'Ver como passageiro' que abrem nova aba já logada na persona escolhida, sem perder minha sessão admin">Botão 'Ver como' no /admin</lov-suggestion>
</lov-actions>

