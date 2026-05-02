## Diagnóstico

Confirmei via busca global no código:

- A string **"Categoria inválida na lista"** NÃO existe em nenhum arquivo de `src/`
- O banco de dados está limpo (`SELECT ... WHERE 'Limpeza' = ANY(service_categories)` retorna 0 linhas)
- Mas o screenshot do usuário mostra o chip "Limpeza" (slug que não existe no catálogo) e o toast com essa mensagem

Isso significa duas coisas:
1. **O navegador está executando código antigo em cache** (service worker / Vite HMR / cache do Lovable preview) — a mensagem foi removida em iteração anterior mas continua sendo entregue
2. **O estado do formulário ainda contém "Limpeza"** mesmo após a limpeza no banco — provavelmente o `dadosIniciais` foi capturado antes do reload e o autosave reescreveu

A sanitização atual existe em 3 pontos (`montarFormInicial`, `concluir`, `SeletorCategoriasServicoInline.onChange`), mas não na origem (hook `useHookOnboardingProfissional`) nem antes do autosave gravar.

## Plano de correção

### 1. Sanitizar na origem (hook que lê do banco)
`src/features/painel/hooks/hook_onboarding_profissional.ts`
- Importar `slugValido`
- Filtrar `service_categories` no `setDados` antes de propagar para o resto do app
- Garante que mesmo se houver lixo no banco, ele NUNCA chega ao formulário

### 2. Sanitizar antes do autosave gravar
`src/features/painel/services/servico_autosave_onboarding.ts`
- Filtrar `service_categories` por `slugValido` antes do `update`
- Bloqueia a regravação de slug inválido como "Limpeza"

### 3. Reset forçado dos slugs ao abrir o diálogo
`src/features/painel/components/dialogo_onboarding_profissional.tsx`
- No `useEffect` que reage a `aberto`, garantir reaplicação de `slugValido` no estado já existente
- Se o saneamento removeu chips, mostrar toast neutro: "Atualizamos sua lista. Refaça a seleção." (sem usar a palavra "inválida")

### 4. Remover/substituir definitivamente a mensagem do schema
`src/features/painel/schemas/schema_onboarding_profissional.ts`
- Trocar a mensagem do `.refine()` para uma neutra que NUNCA contenha "Categoria inválida na lista" — por exemplo: "Refaça a seleção tocando em Editar"
- Como há sanitização nas camadas anteriores, a refine na prática nunca dispara, mas se o cache do usuário ainda exibir a mensagem antiga, ao recarregar a versão nova vai sobrescrever

### 5. Forçar invalidação de cache do PWA / service worker
- Adicionar um log único `console.log("[onboarding] versão sanitização v3")` na inicialização do hook
- Permite confirmar no console do usuário se ele está rodando a versão nova ou cacheada
- Se ainda aparecer "Categoria inválida na lista" após o log aparecer, é prova definitiva de cache no navegador e instruímos `Ctrl+Shift+R`

### 6. Migration de saneamento adicional (defensiva)
Mesmo que a query anterior mostre 0 linhas, vou rodar UPDATE filtrando QUALQUER slug que não esteja no catálogo (não só por regex):
```sql
-- Esse cleanup é feito via lista hardcoded de slugs válidos
-- (mais defensivo que só regex de slug)
```
Vou listar os slugs válidos no SQL e remover do array tudo que não esteja na lista.

## Detalhe técnico

Arquivos editados:
- `src/features/painel/hooks/hook_onboarding_profissional.ts` (sanitização na leitura)
- `src/features/painel/services/servico_autosave_onboarding.ts` (sanitização na escrita)
- `src/features/painel/components/dialogo_onboarding_profissional.tsx` (log + toast neutro)
- `src/features/painel/schemas/schema_onboarding_profissional.ts` (mensagem neutra)

Nenhuma migration de schema; apenas um `UPDATE` defensivo via insert tool.

## Resultado esperado

- Após approve: o usuário recarrega a página (Ctrl+Shift+R no desktop, ou puxar para baixo no mobile) e o erro some
- Mesmo que slugs antigos cheguem do servidor, são filtrados antes de virar chip
- O autosave nunca mais regrava lixo
- O console mostra a versão nova carregada, confirmando cache

## Observação importante

Se mesmo após approve + reload forçado o erro persistir com a mensagem exata "Categoria inválida na lista", o problema é 100% cache do navegador/preview do Lovable, não código. Nesse caso a solução é abrir em aba anônima ou usar a opção "Visualizar histórico" para confirmar que a versão correta está deployada.
