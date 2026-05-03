## Objetivo

Criar uma **página-índice de categorias** que sirva como "hub" de cadastro por tipo de serviço. Cada categoria leva ao cadastro do profissional com a categoria pré-selecionada para uso posterior no onboarding.

## URLs resultantes (testáveis no domínio Lovable)

| URL | Função |
|-----|--------|
| `/s/cadastrar` | Página-índice com cards de todas as categorias |
| `/s/cadastrar/casa-manutencao` | Cadastro com categoria "Casa e Manutenção" pré-selecionada |
| `/s/cadastrar/limpeza-organizacao` | Cadastro com "Limpeza" pré-selecionada |
| `/s/cadastrar/pet` | Cadastro com "Pet" pré-selecionado |
| ...uma URL por categoria de `CATEGORIAS_SERVICO` | |

Os links ficam expostos também em `/dev/links` (página interna de devlinks) para facilitar compartilhar.

## Mudanças

### 1. Nova feature `cadastro_por_categoria`

```
src/features/cadastro_por_categoria/
├── pages/
│   └── pagina_indice_categorias.tsx     # /s/cadastrar
├── components/
│   ├── card_categoria_cadastro.tsx      # card visual por categoria
│   └── grid_categorias_cadastro.tsx     # grid responsivo
└── utils/
    └── obter_categoria_pendente.ts      # lê/limpa localStorage
```

A página-índice:
- Reusa `TemaServicos` e `LogoTriboServicos`.
- Usa `CATEGORIAS_SERVICO` de `constantes_categorias_servico.ts` (já existente) — filtrando `destaque: true` em destaque e listando o resto abaixo.
- Cada card mostra ícone (lucide), nome da categoria e número de subcategorias. Click leva para `/s/cadastrar/{id_categoria}`.
- Layout em grid responsivo (2 colunas mobile, 3-4 desktop). Hover sutil com accent verde.

### 2. Reutilizar a página de cadastro existente com categoria pré-selecionada

Em vez de duplicar, criar wrapper `RedirectCadastroComCategoria` que:
- Recebe `:categoria` da URL.
- Valida contra `CATEGORIAS_SERVICO`. Se inválida → redireciona para `/s/cadastrar`.
- Salva `localStorage.setItem("tribocar_pending_categoria", id)`.
- Renderiza `<PaginaCadastroProfissional />` com um banner topo: "Você está se cadastrando para **{Nome da Categoria}**".

Ajustar `pagina_cadastro_profissional.tsx` para aceitar uma prop opcional `categoriaPreSelecionada` e mostrar o banner quando presente.

### 3. Rotas em `src/App.tsx`

Adicionar:
```tsx
<Route path="/s/cadastrar" element={<PaginaIndiceCategorias />} />
<Route path="/s/cadastrar/:categoria" element={<RedirectCadastroComCategoria />} />
```

### 4. Atualizar página de devlinks

Em `src/features/dev_links/pages/pagina_dev_links.tsx`, adicionar uma seção "Cadastro por categoria" com os links gerados de `CATEGORIAS_SERVICO`, cada um com botão "Copiar link".

### 5. Persistência da categoria para o onboarding (futuro)

Hoje o onboarding não consome categoria, mas a feature já vai gravar `tribocar_pending_categoria` no `localStorage`. Quando o onboarding for ajustado (fora do escopo deste plano), basta ler essa chave e pré-selecionar.

## Fora do escopo

- Não altera o fluxo de onboarding atual.
- Não cria landing pages dedicadas por categoria (apenas hub + cadastro com banner).
- Não altera schema do banco.
- Não muda a rota `/s/cadastro/profissional` existente — continua funcionando como cadastro genérico.
