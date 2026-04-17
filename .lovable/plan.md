

## Diagnóstico

A página `/instalar` mostra "App já está instalado" mesmo sem você ter instalado porque a função `ehStandalone()` está dando **falso positivo**:

- Você está vendo o app dentro do **preview mobile do Lovable** (visível pela barra inferior com Chat/mic/refresh e o ícone ★ no topo)
- Esse wrapper de preview já roda em `display-mode: standalone`
- O código atual considera qualquer `standalone = true` como "TriboCar instalado", sem distinguir o contexto

## Solução

Refinar a detecção pra evitar falso positivo em previews/iframes/hosts do Lovable.

### Mudanças em `pagina_instalar.tsx`

**1. Função `ehStandalone()` mais rigorosa**, retorna `true` somente se TODAS as condições baterem:
- `display-mode: standalone` ativo (ou `navigator.standalone` no iOS)
- **E** NÃO está dentro de iframe (`window.self === window.top`)
- **E** hostname NÃO contém `lovableproject.com`, `lovable.app` com prefixo de preview (`id-preview--`), nem `localhost`
- **E** referrer NÃO é do Lovable

**2. Mesma correção no `sheet_instalacao.tsx`** (usa a mesma lógica e também mostraria comportamento errado)

**3. Extrair pra util compartilhado** `src/compartilhados/utils/detectar_pwa.ts` com:
- `estaInstalado()` — detecção robusta
- `ehIOS()`, `ehAndroid()` — movidos pra cá pra reutilizar

Os dois componentes (`pagina_instalar.tsx` e `sheet_instalacao.tsx`) passam a importar dessa util.

## Arquivos editados

- **Criar** `src/compartilhados/utils/detectar_pwa.ts` — helpers com detecção robusta
- **Editar** `src/features/instalacao/pages/pagina_instalar.tsx` — usar nova util
- **Editar** `src/features/passageiro/components/sheet_instalacao.tsx` — usar nova util

## Como testar

1. Abrir `/instalar` no preview do Lovable → deve mostrar **as instruções de instalação** (não o "já instalado")
2. Abrir `/instalar` no Safari real do iPhone → mostra passos do iOS
3. Instalar de fato e abrir → aí sim mostra "já instalado"

