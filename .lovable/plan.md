

## Diagnóstico

O erro do Safari "**servidor não pode ser encontrado**" é um erro de **DNS**, não de roteamento da aplicação. Verifiquei via `dig` e nenhum desses domínios resolve:

- `turbo.tribocar.com` → sem registro
- `tribocar.com` → sem registro
- `www.tribocar.com` → sem registro

A rota `/cadastro` existe e funciona normalmente em `App.tsx` (linha 37) — o problema é anterior, o navegador nem chega a alcançar o servidor.

A URL atual publicada do projeto é:
- **Preview**: `https://id-preview--bfa5b0fa-aeb3-4c6e-8df3-d495e7f6c6b8.lovable.app`
- **Publicada**: `https://motoristalivre.lovable.app`

Ou seja, hoje o app está acessível em `motoristalivre.lovable.app/cadastro?tipo=motorista`, **não** em `turbo.tribocar.com`.

## Causas possíveis

1. **O domínio `tribocar.com` ainda não foi conectado** ao projeto via Lovable (Settings → Domains).
2. **O domínio existe mas o subdomínio `turbo` não tem registro CNAME/A** apontando para a Lovable.
3. **Propagação de DNS pendente** (caso tenha sido configurado há poucos minutos — costuma levar de minutos a algumas horas).

## Plano de ação

Como isto é uma questão de configuração de domínio (não de código), o caminho é:

### 1. Verificar se o domínio foi adicionado no projeto
Abrir **Project Settings → Domains** no Lovable e conferir se `turbo.tribocar.com` (ou `tribocar.com`) está listado como custom domain conectado.

### 2. Se ainda não foi adicionado
- Publicar o projeto (já está publicado em `motoristalivre.lovable.app`).
- Em **Settings → Domains**, clicar em **Connect Domain** e adicionar `turbo.tribocar.com`.
- Lovable vai mostrar o registro DNS necessário (geralmente um `CNAME turbo → cname.lovable.app` ou similar).

### 3. Configurar DNS no provedor do domínio
No painel do registrador onde `tribocar.com` está hospedado (Registro.br, GoDaddy, Cloudflare, etc.), adicionar:

```text
Tipo:  CNAME
Nome:  turbo
Valor: <valor que o Lovable indicar>
TTL:   3600
```

### 4. Aguardar propagação e validar
Após salvar, aguardar 5–60 minutos e testar novamente:
```bash
dig turbo.tribocar.com
```
Quando retornar IP/CNAME, o link `https://turbo.tribocar.com/cadastro?tipo=motorista` funcionará automaticamente — o roteamento do React já trata `/cadastro` corretamente.

### 5. (Opcional) Tratar o query param `?tipo=motorista`
Verifiquei `pagina_cadastro.tsx` — atualmente ela **não lê** `?tipo=motorista` para pré-selecionar o tipo de conta. Se a intenção do link é levar diretamente para o cadastro de motorista (e não passageiro), preciso adicionar leitura do `searchParams` na página de cadastro. Posso fazer isso em seguida, é uma alteração de código pequena.

## Próximo passo imediato

Como o ajuste principal (DNS) é fora do código, não há nada para alterar no repositório agora. Se confirmar que quer:
- **(a)** Apenas instruções para configurar o domínio → já está acima.
- **(b)** Que eu ajuste o `pagina_cadastro.tsx` para ler `?tipo=motorista|passageiro|afiliado` e pré-selecionar — posso fazer assim que você aprovar.

<lov-actions>
<lov-suggestion message="Ajuste a pagina_cadastro.tsx para ler o query param ?tipo=motorista|passageiro|afiliado e pré-selecionar o tipo de conta automaticamente">Ler ?tipo no /cadastro</lov-suggestion>
<lov-suggestion message="Abra Project Settings → Domains e me oriente passo a passo para conectar o domínio turbo.tribocar.com a este projeto">Conectar domínio turbo.tribocar.com</lov-suggestion>
<lov-suggestion message="Por enquanto use motoristalivre.lovable.app/cadastro?tipo=motorista — atualize qualquer link/material que esteja apontando para turbo.tribocar.com">Trocar links para .lovable.app</lov-suggestion>
</lov-actions>
