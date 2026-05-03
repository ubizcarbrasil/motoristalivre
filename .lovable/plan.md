## Objetivo

Adicionar à home pública (`/`) uma seção de **descoberta de tribos** com busca por nome, filtro por categoria e por cidade, para que visitantes encontrem e ingressem em tribos existentes.

## O que será entregue

1. **Nova seção na landing** (`PaginaLanding`) entre Benefícios e Planos: "Encontre uma tribo".
2. **Página dedicada** `/tribos` com listagem completa, busca por texto, filtros de categoria e cidade.
3. **Cards de tribo** mostrando logo, nome, cidade, categoria, descrição curta e CTA "Ver tribo" + "Entrar na tribo" (quando houver `signup_slug`).
4. Ao clicar em "Entrar", leva para `/s/cadastro/tribo/:signup_slug` (fluxo já existente).
5. Ao clicar em "Ver tribo", leva para a vitrine pública (`/s/:slug` ou `/:slug` conforme módulo ativo).

## Arquitetura (feature `descoberta_tribos`)

```
src/features/descoberta_tribos/
├── pages/pagina_descoberta_tribos.tsx
├── components/
│   ├── secao_descoberta_home.tsx      # bloco compacto p/ landing (top 6)
│   ├── barra_filtros_tribos.tsx        # busca + selects categoria/cidade
│   ├── grid_tribos.tsx
│   ├── card_tribo_publica.tsx
│   └── estado_vazio_tribos.tsx
├── hooks/hook_descoberta_tribos.ts     # estado de filtros + fetch
├── services/servico_descoberta_tribos.ts
└── types/tipos_descoberta_tribos.ts
```

## Dados (somente leitura, sem migrations)

Service (`servico_descoberta_tribos.ts`):

- `listarTribosPublicas(filtros)` → join `tenants` + `tenant_branding` + `service_categories`.
  - Filtra por `is_visible_public = true` e `status = 'active'`.
  - Filtros opcionais: `categoria_slug`, `cidade` (ilike), `busca` (ilike sobre `name`).
  - Retorna: id, slug, name, signup_slug, active_modules, city, description, logo_url, cover_url, categoria (id/slug/nome).
- `listarCategoriasComTribos()` → categorias ativas que possuem ao menos uma tribo pública (para popular o filtro).
- `listarCidadesComTribos()` → cidades distintas de tenant_branding com tribo pública.

Tudo via RLS pública já existente (`tenants` é leitura pública para registros visíveis; `tenant_branding` idem; `service_categories` idem).

## UI

- **`SecaoDescobertaHome`**: header "Encontre sua tribo", input de busca rápido, chips das principais categorias, grid de até 6 cards e botão "Ver todas as tribos" → `/tribos`.
- **`PaginaDescobertaTribos`**: header com busca, dois selects (categoria, cidade) usando shadcn `Select`, grid responsivo (1/2/3 colunas), estado vazio amigável, skeletons no carregamento.
- **`CardTriboPublica`**: capa/logo, nome, badge de categoria, cidade com ícone `MapPin`, descrição (line-clamp 2), botões "Ver tribo" e "Entrar".
- Dark mode, design system existente, IBM Plex Sans, accent #1db865.

## Roteamento

- `App.tsx`: adicionar `<Route path="/tribos" element={<PaginaDescobertaTribos />} />` na seção pública.
- `RodapeLanding` ganha link "Tribos".

## Comportamento

- Filtros sincronizados com a URL (`?q=&categoria=&cidade=`) para compartilhamento.
- Debounce de 300ms na busca por texto.
- Loading com skeleton, vazio com CTA "Criar minha tribo" → `/s/cadastro/tribo`.

## Critérios de aceitação

- Visitante anônimo acessa `/` e vê a seção com tribos públicas.
- Filtra por categoria e cidade na página `/tribos`, resultados atualizam.
- Card "Entrar" só aparece quando a tribo tem `signup_slug`.
- Apenas tribos com `is_visible_public = true` e `status = 'active'` aparecem.
