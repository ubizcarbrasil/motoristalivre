
Resposta direta: o link web público fora do editor é este:

- Publicado: https://motoristalivre.lovable.app

Use estes links exatos:

- Passageiro do grupo demo: https://motoristalivre.lovable.app/demo
- Passageiro direto no motorista demo: https://motoristalivre.lovable.app/demo/motorista-demo
- Login do motorista: https://motoristalivre.lovable.app/entrar
- Painel do motorista após login: https://motoristalivre.lovable.app/painel
- Página de teste com contas prontas: https://motoristalivre.lovable.app/dev/personas

Credenciais de teste:

- Motorista: motorista@tribocar.test
- Passageiro: passageiro@tribocar.test
- Senha: Tribo@2025

Importante:

- Não use o link de preview `id-preview--...`
- Use só `https://motoristalivre.lovable.app`
- O app do passageiro é público
- O app do motorista abre pela web também, mas exige login em `/entrar` antes de ir para `/painel`

Se você quiser o formato do seu grupo real, é assim:

- Passageiro: `https://motoristalivre.lovable.app/SEU_SLUG`
- Motorista direto por link: `https://motoristalivre.lovable.app/SEU_SLUG/SLUG_DO_MOTORISTA`

Exemplo:
- `https://motoristalivre.lovable.app/turbo`

O que o código confirma agora:

- A publicação está pública
- Passageiro usa rotas `/:slug` e `/:slug/:driver_slug`
- Motorista usa `/entrar` e depois `/painel`

Se o que você quer é só testar agora sem configurar nada, abra nesta ordem:

1. Passageiro: `https://motoristalivre.lovable.app/demo/motorista-demo`
2. Motorista: `https://motoristalivre.lovable.app/dev/personas`
3. Clique em “Login direto” no card Motorista

Se você aprovar a próxima implementação, eu organizo isso para nunca mais ter dúvida:
1. Colocar botão “Abrir app do passageiro” na tela principal
2. Colocar botão “Entrar como motorista”
3. Exibir os links públicos prontos para copiar
4. Corrigir o fluxo de solicitação do passageiro se ainda estiver falhando
