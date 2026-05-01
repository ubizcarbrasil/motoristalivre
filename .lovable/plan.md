## Objetivo

Transformar a lista informal de categorias em uma **taxonomia oficial do app**, com IDs estáveis, ícones identificáveis e dois pontos de uso:

1. **Profissional** — escolhe categorias/subcategorias no cadastro/onboarding e na vitrine.
2. **Cliente** — explora por categorias na home pública (tela inicial estilo "Serviços mais procurados").

A taxonomia vira a fonte única da verdade. Não cria tabela nova no banco — usamos o campo `drivers.service_categories` (já existente) guardando os **slugs** das subcategorias (ex.: `eletricista`, `diarista`, `dog-walker`). Categorias-pai ficam como agrupador visual.

---

## Etapa 1 — Taxonomia oficial (constantes)

Novo arquivo: `src/compartilhados/constants/constantes_categorias_servico.ts`

Estrutura:

```text
CategoriaServico {
  id: slug-kebab          // "casa-manutencao"
  nome: string            // "Casa e Manutenção"
  icone: LucideIcon       // ícone-pai
  destaque?: boolean      // aparece em "Mais procurados"
  subcategorias: SubcategoriaServico[]
}

SubcategoriaServico {
  id: slug-kebab          // "eletricista"
  nome: string            // "Eletricista"
  icone: LucideIcon
  grupo?: string          // sub-agrupador interno opcional ("Elétrica", "Hidráulica"…)
  destaque?: boolean      // aparece em "Mais procurados"
}
```

15 categorias (idênticas à lista enviada):

1. Casa e Manutenção · `Wrench`
2. Limpeza e Organização · `Sparkles`
3. Família e Domésticos · `Users`
4. Beleza e Bem-estar · `Sparkles` / `Scissors`
5. Pet · `PawPrint`
6. Tecnologia · `Laptop`
7. Automotivo · `Car`
8. Eventos e Festas · `PartyPopper`
9. Educação e Aulas · `GraduationCap`
10. Serviços Profissionais · `Briefcase`
11. Saúde · `HeartPulse`
12. Condomínios e Empresas · `Building2`
13. Entregas e Mudanças · `Truck`
14. Segurança · `ShieldCheck`
15. Jardim e Piscina · `Trees`

Cada subcategoria recebe um ícone Lucide identificável (ex.: Eletricista → `Zap`, Encanador → `Droplets`, Pintor → `PaintBucket`, Diarista → `Sparkles`, Babá → `Baby`, Cozinheira → `ChefHat`, Manicure → `Hand`, Cabeleireiro → `Scissors`, Massagista → `HandHeart`, Banho e tosa → `Bath`, Dog walker → `Dog`, Veterinário → `Stethoscope`, Conserto celular → `Smartphone`, Mecânico → `Wrench`, DJ → `Music`, Aulas → `BookOpen`, Advogado → `Scale`, Contador → `Calculator`, Enfermeiro → `Syringe`, Motoboy → `Bike`, Frete → `Truck`, Câmeras → `Camera`, Jardineiro → `Trees`, Piscina → `Waves`, etc.).

Helpers exportados:

- `listarCategorias()`
- `listarSubcategorias()`
- `buscarSubcategoria(id)` → `{ subcategoria, categoria }`
- `subcategoriasDestaque()` (para "Serviços mais procurados")
- `categoriasDestaque()`
- `iconePorSlug(slug)` (fallback `Tag`)

Tipos correspondentes em `src/compartilhados/types/tipos_categorias_servico.ts`.

---

## Etapa 2 — Galeria de ícones (preview interno)

Arquivo: `src/compartilhados/components/galeria_categorias.tsx`

Componente puramente visual usado internamente para QA/preview, exibe todas categorias e subcategorias em grid com seus ícones (chips arredondados, fundo `card`, borda `border`, accent verde do design system). Será usado como referência e também aproveitado nos seletores das próximas etapas.

---

## Etapa 3 — Seletor de categorias (profissional)

Novo componente: `src/features/painel/components/seletor_categorias_servico.tsx`

- Modal/drawer com busca, lista por categoria, marca múltiplas subcategorias.
- Mostra ícone + nome.
- Limite mantido (10) e validação no schema.
- Retorna lista de **slugs**.

Integrar em:

- `secao_categorias_admin.tsx` — substituir o input de texto livre pelo seletor (mantendo `service_categories` no banco; agora guarda slugs).
- `dialogo_onboarding_profissional.tsx` / `schema_onboarding_profissional.ts` — usar o mesmo seletor.

Exibição (chips na vitrine, perfil público, header etc.) passa a usar `iconePorSlug` + `nome` da taxonomia. Slugs antigos (texto livre) que não existirem na taxonomia ainda renderizam com ícone `Tag` (compatibilidade retroativa, sem migração de banco).

---

## Etapa 4 — Descoberta pelo cliente

Novo componente: `src/features/passageiro/components/grade_categorias_servico.tsx`

Layout conforme briefing:

- **"Serviços mais procurados"** — grid 4 colunas (mobile 4×2) com `subcategoriasDestaque()`.
- Abaixo, **categorias-pai** em cards maiores agrupados por área (Casa, Família, Bem-estar, Mobilidade, Empresas).
- Tap em categoria → drawer com subcategorias.
- Tap em subcategoria → navega para listagem filtrada (rota já existente da vitrine pública por tribo, com query param `?cat=<slug>`).

A página pública de mobilidade/serviços lê `?cat=` e aplica filtro sobre `drivers.service_categories` (`.contains([slug])`).

---

## Etapa 5 — Compatibilidade e ajustes finais

- Nenhuma migração de schema necessária.
- Onboarding: campo `service_categories` agora valida que cada item exista na taxonomia (Zod `refine`).
- Adicionar utilitário `normalizar_slug.ts` para garantir kebab-case ao gravar.
- Ajustar `header_perfil.tsx` e demais leitores para resolver ícone via `iconePorSlug`.

---

## Estrutura de arquivos

```text
src/compartilhados/
  constants/constantes_categorias_servico.ts   (NOVO – taxonomia completa)
  types/tipos_categorias_servico.ts             (NOVO)
  components/galeria_categorias.tsx             (NOVO – preview)
  utils/normalizar_slug.ts                      (NOVO)

src/features/painel/components/
  seletor_categorias_servico.tsx                (NOVO)
  secao_categorias_admin.tsx                    (EDITA – usa seletor)
  dialogo_onboarding_profissional.tsx           (EDITA – usa seletor)

src/features/painel/schemas/
  schema_onboarding_profissional.ts             (EDITA – valida slugs)

src/features/passageiro/components/
  grade_categorias_servico.tsx                  (NOVO – home cliente)

src/features/passageiro/pages/
  pagina_passageiro.tsx                         (EDITA – integra grade + leitura ?cat)
```

---

## Detalhes técnicos

- Slugs em ASCII kebab-case, sem acentos. Função `normalizarSlug` aplicada em runtime no salvar.
- Ícones importados nominalmente do `lucide-react` (sem `dynamicIconImports`) para tree-shaking previsível.
- Toda renderização respeita o design system: chips `bg-card`, `border-border`, ícone em `text-primary`, hover sutil; nada custom.
- Para a galeria/seletor: grid responsivo `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`, gap consistente, foco visível.
- Acessibilidade: cada botão de subcategoria com `aria-label="<nome> – <categoria>"`.
- Performance: a taxonomia é estática em módulo, ~250 itens, sem custo perceptível.
- Não tocar em `src/integrations/supabase/*`.

---

## Critérios de aceite

1. Profissional consegue selecionar categorias num seletor com busca e ícones, ver os chips no perfil público com ícone correto.
2. Cliente vê na home uma seção "Mais procurados" e categorias agrupadas, navega até listagem filtrada.
3. Slugs antigos continuam aparecendo (com ícone fallback) — sem quebrar perfis existentes.
4. Taxonomia é a única fonte da verdade para nomes/ícones.
