## Objetivo

Hoje o link público do profissional (`/s/:slug/:driver_slug`) renderiza um cabeçalho "vazio": sem banner de capa, sem bio, sem selo de verificação e sem chips das categorias de serviço — mesmo que o profissional já tenha cadastrado tudo isso. O componente `CabecalhoPerfilProfissional` recebe esses campos, mas a página os passa hardcoded como `null`/`false`/`[]`.

Vamos puxar os dados reais do `drivers` e exibi-los na vitrine pública.

## O que vai mudar visualmente

Na página pública do profissional (`/s/:slug/:driver_slug`):

1. **Banner de capa** (`cover_url`) preenchendo o topo, com gradiente de leitura, em vez do gradiente roxo vazio.
2. **Bio** do profissional logo abaixo do nome.
3. **Selo "perfil verificado"** (azul) quando `is_verified = true` — já existe ícone, falta dado.
4. **Chips de categorias de serviço** (ex.: "limpeza", "casa em condomínio fechado", "estética") abaixo do nome/cidade, usando os labels já mapeados em `constantes_categorias_servico`.
5. Quando a categoria tiver um id conhecido, mostra o **nome amigável em pt-BR** (não o slug bruto).

## Mudanças técnicas

### 1. `hook_dados_servico_motorista.ts`
Estender a query do `drivers` para também trazer:
- `cover_url`
- `bio`
- `is_verified`
- `service_categories`

E expor esses 4 campos no retorno do hook (`DadosDriverServico`).

### 2. `pagina_perfil_profissional_servicos.tsx`
Substituir os literais hardcoded pelos campos do hook:

```tsx
<CabecalhoPerfilProfissional
  nome={dados.full_name}
  avatarUrl={dados.avatar_url}
  coverUrl={dados.cover_url}
  bio={dados.bio}
  isVerified={dados.is_verified}
  credentialVerified={dados.credential_verified}
  credentialType={dados.credential_type}
  serviceCategories={dados.service_categories}
  cidade={tenant.branding?.city ?? null}
/>
```

### 3. `cabecalho_perfil_profissional.tsx`
Hoje os chips renderizam `cat.replace(/_/g, " ")`. Vamos resolver o label amigável usando o catálogo existente em `src/compartilhados/constants/constantes_categorias_servico.ts` (categorias e subcategorias) — fallback para o replace atual se o id não for encontrado. Assim "casa_em_condominio_fechado" vira "Casa em condomínio fechado".

Pequeno helper `resolverNomeCategoria(id: string): string` colocado em `src/features/triboservicos/utils/`.

### 4. (Opcional, mesmo passo) Vitrine do tenant `/s/:slug`
A listagem de profissionais já carrega `cover_url`, `service_categories` e `is_verified` via `listarProfissionaisVitrine`. Verificar se o card está exibindo cover e chips — se não estiver, aplicar o mesmo helper de label amigável para ficar consistente.

## Arquivos afetados

- `src/features/passageiro/hooks/hook_dados_servico_motorista.ts` (estender query e tipo de retorno)
- `src/features/triboservicos/pages/pagina_perfil_profissional_servicos.tsx` (usar dados reais)
- `src/features/triboservicos/components/cabecalho_perfil_profissional.tsx` (label amigável)
- `src/features/triboservicos/utils/resolver_nome_categoria.ts` (novo helper)

## Fora de escopo

- Editor de banner/bio/categorias (já existe no painel do profissional).
- Mudanças no fluxo de agendamento ou no rodapé.
- Mexer na vitrine de mobilidade.

Quando aprovar, eu implemento.