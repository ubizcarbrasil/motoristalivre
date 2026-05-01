# Página de QA de Links — `/dev/links`

Criar uma página simples (rota dev, sem autenticação obrigatória) que lista todas as tribos cadastradas no banco e gera os links clicáveis de todos os fluxos públicos para cada uma. Serve para testar rapidamente o sistema ponta a ponta sem precisar digitar slugs manualmente.

## O que será criado

### Nova feature: `src/features/dev_links/`

```
src/features/dev_links/
├── pages/
│   └── pagina_dev_links.tsx         # tela principal
├── components/
│   ├── card_tribo_links.tsx         # card por tribo com links
│   ├── secao_links_globais.tsx      # links que não dependem de tribo
│   └── linha_link.tsx               # uma linha (label + URL + botão copiar)
├── hooks/
│   └── hook_listar_tribos_dev.ts    # busca tenants do banco
├── services/
│   └── servico_dev_links.ts         # query dos tenants
├── types/
│   └── tipos_dev_links.ts           # TriboDev, GrupoLinks
└── utils/
    └── construtor_links.ts          # monta as URLs por slug
```

### Estrutura da tela

**Topo:** título "Links para teste" + descrição curta.

**Seção 1 — Links globais** (não dependem de tribo):
- `/` Landing mobilidade
- `/s` Landing serviços
- `/acesso` Hub de acessos
- `/entrar`, `/cadastro`
- `/motorista/acesso`, `/motorista/cadastro`
- `/profissional/acesso`, `/profissional/cadastro`
- `/admin/acesso`
- `/instalar`

**Seção 2 — Tribos cadastradas** (uma card por tenant retornado do banco):
Cada card mostra: nome da tribo, slug em mono, módulos ativos como badges, e os links da tribo:
- `/{slug}` — passageiro (mobilidade)
- `/m/{slug}` — mobilidade direto (só se `mobility` em active_modules)
- `/s/{slug}` — vitrine serviços (só se `services` em active_modules)
- `/{slug}/{driver_slug}` — exemplo com primeiro motorista da tribo (se houver)

Cada linha tem: label, URL clicável (abre em nova aba) e botão copiar (toast "Copiado").

### Roteamento
Adicionar em `src/App.tsx`:
```tsx
<Route path="/dev/links" element={<PaginaDevLinks />} />
```
Sem proteção (igual a `/dev/personas` que já existe).

### Query
`servico_dev_links.ts` faz:
```sql
select id, slug, name, active_modules from tenants order by created_at desc;
```
Para cada tribo, opcionalmente busca o primeiro motorista:
```sql
select slug from drivers where tenant_id = ? limit 1;
```

## Detalhes técnicos

- Usa tokens do design system (bg `#000`, accent `#1db865`, fonte IBM Plex Sans).
- Componentização: `LinhaLink` é reutilizável, `CardTriboLinks` compõe várias linhas, `SecaoLinksGlobais` segue mesmo padrão.
- Sem chamadas de API em componente visual — tudo passa pelo `servico_dev_links.ts` e hook.
- Tipos: `TriboDev { id, slug, name, modulos, motoristaSlug? }`.
- Botão copiar usa `navigator.clipboard.writeText` + `toast` do sonner.

## Fora do escopo
- Não cria autenticação para a rota.
- Não modifica `/acesso` nem `docs/links_acesso.md`.
- Não adiciona QR codes (pode ser próxima iteração se quiser).
