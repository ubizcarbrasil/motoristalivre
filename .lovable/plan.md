Diagnóstico: o link público com `@handle` ainda cai em tela preta porque a rota atual foi definida como `/:prefixo + :handle` (`/@:handle` e `/%40:handle`). Pela documentação do React Router v6, segmentos dinâmicos não podem ser parciais; ou seja, `@:handle` não é um padrão confiável. Em produção, o app carrega o bundle, mas o React não renderiza conteúdo para `@alecio-cavalcante`, e nenhuma chamada `resolve_handle` é feita. O perfil canônico `/s/papalegua/alecio-cavalcante` funciona.

Plano de correção:

1. Ajustar o roteamento de handles
   - Remover a dependência de rotas parciais como `/:prefixo:param`.
   - Usar uma rota segura `/:slug` para capturar `@alecio-cavalcante` e `%40alecio-cavalcante` como um segmento inteiro.
   - Fazer o `ResolverPublicoTenant` reconhecer o segmento decodificado que começa com `@` e renderizar diretamente o resolver de handle, em vez de tentar navegar novamente para uma rota parcial.

2. Tornar o resolver de handle independente de parâmetro parcial
   - Atualizar `PaginaResolverHandle` para aceitar um `handle` via prop opcional.
   - Quando não receber prop, continuar usando `useParams` para compatibilidade.
   - Normalizar sempre: `decodeURIComponent`, remover `@`, `trim`, `lowercase`.

3. Corrigir o fallback de link não encontrado
   - Em caso de handle inexistente, exibir uma tela clara “Perfil não encontrado” em vez de redirecionar para `/404`, porque hoje não existe rota explícita `/404` e isso pode gerar experiência confusa.

4. Garantir que links gerados internamente continuem corretos
   - Manter os links preferenciais como `/@handle` para compartilhamento.
   - Se necessário, usar a rota canônica `/s/:tenant/:driver` apenas como destino final após resolver.

5. Validar após alteração
   - Testar no preview as URLs:
     - `/@alecio-cavalcante`
     - `/%40alecio-cavalcante`
     - `/s/papalegua/alecio-cavalcante`
   - Confirmar que a tela não fica preta e que a página redireciona ou renderiza o perfil corretamente.

Observação importante: o link `bfa5b0fa...lovableproject.com` é um link privado de preview e pode exigir login no Lovable para clientes externos. Para divulgação ao cliente, o ideal é usar o domínio público `https://www.motoristalivre.com.br/@alecio-cavalcante` ou `https://motoristalivre.lovable.app/@alecio-cavalcante`. A correção acima mira exatamente esse domínio público também.