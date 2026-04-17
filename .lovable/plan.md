
O usuário enviou um print da tela "Escolha um motorista" (lista de motoristas do grupo `papalegua`) e disse "Isso eu não entendi".

Olhando o print, é a tela `ListaMotoristasTenant` que aparece quando alguém abre `/papalegua` (slug do grupo, sem motorista específico). Ela lista os motoristas do grupo pra o passageiro escolher.

Provavelmente o usuário ficou confuso porque:
1. Clicou em "Solicitar corrida" no painel admin esperando ir direto pro mapa
2. Mas caiu nessa tela intermediária pedindo pra escolher um motorista

Isso acontece porque a rota `/{tenantSlug}` abre o app de passageiro do grupo — quando não tem motorista específico no link, mostra a lista pra escolher.

Não é um plano de implementação ainda — é uma dúvida. Vou só explicar o que é essa tela e perguntar o que ele esperava, sem propor mudança ainda.

Como é resposta de esclarecimento (não implementação), não preciso de `<lov-plan>` formal — mas as instruções dizem que estou em plan mode e preciso responder dentro de tags. Vou usar uma explicação curta dentro do bloco.

## O que é essa tela

Essa é a tela **"Escolha um motorista"** do grupo `papalegua`. Ela aparece quando você abre o link **só com o nome do grupo** (`/papalegua`), sem indicar um motorista específico.

## Por que apareceu

Quando você clicou em **"Solicitar corrida"** no painel admin, te levei pra `/{tenantSlug}` — ou seja, `/papalegua`. Como o link é do grupo inteiro (não de um motorista específico), o sistema abre essa lista pra você **escolher qual motorista** quer chamar.

## Como funciona normalmente

- **Link do grupo** (`/papalegua`) → mostra lista de motoristas pra escolher (essa tela)
- **Link do motorista** (`/papalegua/carlos-silva`) → vai direto pro mapa pedindo corrida pro Carlos

## O que você esperava?

Me diz qual desses comportamentos faz mais sentido pra você quando clica em "Solicitar corrida" no painel admin:

1. **Manter como está** — abre a lista do grupo pra escolher qualquer motorista (útil pra testar dispatch automático: o sistema escolhe quem aceitar primeiro)
2. **Ir direto pro mapa sem escolher motorista** — solicita pro grupo inteiro (qualquer motorista online pode aceitar via dispatch)
3. **Outra coisa** — me explica o que esperava ver

Me responde qual opção e eu ajusto.
