## Problema

No onboarding profissional, o usuário fica preso no Passo 2 com o erro "Categoria inválida na lista" ao clicar em **Avançar**, mesmo que as categorias visíveis pareçam corretas.

### Causa raiz

O perfil do profissional (`drivers.service_categories` no banco) contém uma entrada legada `"Limpeza"` (com L maiúsculo, texto livre) que **não corresponde a nenhum id de categoria válido**. Os ids válidos do catálogo são tipo `"encanador"`, `"limpeza-pos-obra"`, `"troca-registro"`, etc.

Como o chip mostra o `nomePorSlug(slug)` que faz fallback para o próprio slug quando ele não é encontrado, a string `"Limpeza"` aparece como se fosse uma categoria normal, mas o schema (`schemaOnboardingProfissional`) rejeita no `.refine(slugValido)`.

### Confirmação no banco

```
service_categories: ["Limpeza", "encanador", "troca-vaso-sanitario",
                     "instalacao-filtro", "troca-registro", "desentupimento"]
```

Apenas `"Limpeza"` é inválido — os outros 5 estão certos.

### Origem provável

A função `adicionarCategoria` no `dialogo_onboarding_profissional.tsx` (linhas 144-161) aceita texto livre via `novaCategoria` e salva sem normalizar para slug. Esse fluxo está obsoleto desde que o `SeletorCategoriasServico` foi adotado, mas ainda existe e gerou o lixo legado.

## Solução

### 1. Sanitizar `service_categories` ao carregar o formulário

Em `montarFormInicial` (final do `dialogo_onboarding_profissional.tsx`), filtrar a lista usando `slugValido()` antes de popular o estado. Categorias antigas inválidas são descartadas silenciosamente — o usuário simplesmente não vê o item quebrado.

### 2. Remover o adicionar de categoria por texto livre

Apagar `novaCategoria`, `setNovaCategoria`, `adicionarCategoria`, `removerCategoria` e os props relacionados de `PassoTipoCategorias`. O único caminho oficial passa a ser o `SeletorCategoriasServicoInline`, que já só emite ids válidos do catálogo. Isso impede que novos profissionais voltem a salvar slugs inválidos.

### 3. Mensagem de erro mais clara no schema

Trocar `"Categoria inválida na lista"` por algo direcionado ao usuário, por exemplo:

```
"Algumas categorias antigas não são mais suportadas. Toque em Editar e refaça a seleção."
```

Mesmo com a sanitização do passo 1, manter uma mensagem útil caso ainda apareça o erro em outros pontos.

### 4. (Opcional) Migration de saneamento

Como há registros antigos com slugs inválidos espalhados no banco, posso opcionalmente rodar uma migration que remove entradas inválidas de `drivers.service_categories`. Sem essa migration, cada perfil é limpo no primeiro `salvar` após reabrir o dialog (via passo 1).

## Arquivos afetados

```text
src/features/painel/components/dialogo_onboarding_profissional.tsx   (sanitização + remover entrada livre)
src/features/painel/schemas/schema_onboarding_profissional.ts        (mensagem clara)
supabase/migrations/<novo>.sql                                       (opcional — saneamento)
```

## Confirmar antes de executar

- [ ] Quer que eu inclua a migration de saneamento para limpar todos os perfis legados de uma vez?  
- [ ] Posso remover o campo de "categoria livre" sem reservar fallback (ele não é mais usado pela UI atual)?
