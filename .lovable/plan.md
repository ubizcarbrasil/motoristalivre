
## Diagnóstico do que está aparecendo

A tela do print é a rota `/@handle` (perfil público), renderizada por `pagina_perfil_motorista.tsx`. Três problemas concretos:

1. **Bloco fantasma no topo** ("Adicionar serviço" / "Comissões e fidelidade" desfocado + um "P" gigante) — é o `HeaderPerfil` desta página: a cover não está carregando bem e o avatar entra como fallback enorme (`h-24 w-24` com inicial). Visualmente parece um card de onboarding sobrando.
2. **Especialidades como chips de texto** ("Marido de aluguel", "Pequenos reparos"…) — vêm de `ChipsCategorias` + `SecaoSobreProfissional`. Está duplicado (aparece no header e de novo no card "Sobre Profissional"). Não tem nada do visual de "app de serviço" com foto que já existe em `VitrineEspecialidadesVisuais` / `SecaoEspecialidadesPublica`.
3. **Footer institucional poluindo** (segundo print, riscado pelo usuário) — `FooterServicos` mostra "Tribo Serviços / Produto: Sou profissional / Sou operadora / Entrar / Suporte". Isso não é footer de página pública de prestador, é footer de site institucional. Está sendo usado dentro do perfil.

A rota `/@handle` cai em `pagina_perfil_motorista`, mas a versão visualmente correta (cover + vitrine de especialidades com foto + bottom bar) já existe em `pagina_perfil_profissional_servicos`. As duas estão divergindo.

## Objetivo

Deixar a página pública do profissional (`/@handle` e `/s/:slug/:driver_slug`) com cara de app de serviço de verdade: **cover → avatar normal → nome + cidade → grid visual de especialidades com foto → portfólio → bottom bar com CTA**. Sem footer institucional, sem chips duplicados, sem "P" gigante.

## Mudanças

### 1. `pagina_perfil_motorista.tsx` (rota `/@handle`)

- **Remover** o uso de `HeaderPerfil` antigo (que produz o avatar gigante centralizado e a cover frouxa).
- **Substituir** pelo mesmo `CabecalhoPerfilProfissional` já usado em `pagina_perfil_profissional_servicos` — cover hero + avatar `w-24 h-24` alinhado à esquerda + nome + cidade + chips compactos (máx 5).
- **Remover a duplicação** de "Sobre Profissional" + chips de Especialidades. Manter um único bloco "Sobre" curto (bio + verificado + cidade), sem repetir a lista de especialidades como chips de texto.
- **Remover do meio da página** as seções que não são de cliente: "Distribuição de notas", "Lista de avaliações", "Grid Métricas", "Info veículo" (quando o tipo é `service_provider`), "Disponibilidade pública", e o card "Grupo / tenant slug". Esses elementos pertencem ao painel interno, não à página de venda.
- **Manter visível**, em ordem:
  1. Cover + identidade
  2. Bio curta (se houver)
  3. **Vitrine visual de especialidades** (`SecaoEspecialidadesPublica` já existe, com foto Unsplash por categoria — usar como bloco principal quando não há serviços precificados; quando há, mostrar `SecaoServicosPublica`)
  4. Portfólio (se houver imagens)
  5. Equipe (se houver)
- **Bottom bar fixa** com um único CTA forte: "Agendar agora" (se há serviços) ou "Solicitar orçamento" via WhatsApp.

### 2. `FooterServicos` na página pública

- **Remover** `<FooterServicos />` de `pagina_perfil_profissional_servicos.tsx`. Página de prestador não leva footer de site corporativo.
- O footer institucional continua existindo, mas só é usado em landing/marketing (`pagina_landing`, vitrine `/s/:slug`).

### 3. Avatar fallback gigante ("P")

- Reduzir o avatar em `CabecalhoPerfilProfissional` para `w-20 h-20` em mobile (`<= 430px`), `w-24 h-24` em telas maiores. Tamanho da inicial cai junto.
- Quando não há `avatar_url`, em vez de letra solta, usar inicial sobre fundo `bg-primary/10` com a cor da marca — o que já existe, mas hoje a letra está com `text-2xl` e parece desproporcional em mobile.

### 4. Topo do scroll (o "card desfocado" do print)

- O efeito do print ("Comissões e fidelidade" aparecendo desfocado atrás) é o gradiente `from-background via-background/50 to-transparent` aplicado por cima de uma imagem que falhou ao carregar, com o avatar gigante por cima. Ao trocar pelo `CabecalhoPerfilProfissional` (que já tem fallback de cover por categoria via `imagemDeCapa`) e reduzir o avatar, esse "fantasma" desaparece naturalmente.

### 5. Vitrine de especialidades — paridade visual

- Garantir que `SecaoEspecialidadesPublica` (usada na rota `/@handle`) e `VitrineEspecialidadesVisuais` (usada em `/s/:slug/:driver_slug`) tenham **exatamente o mesmo layout**: grid `grid-cols-2` em mobile, `aspect-[4/3]`, foto Unsplash por categoria, título sobreposto com gradiente, tap → WhatsApp com a especialidade no texto.
- Hoje as duas já existem e são quase idênticas — vou consolidar em um único componente em `compartilhados/components/` para evitar drift futuro.

## Resultado esperado (mobile 430px)

```text
┌─────────────────────────────┐
│ [<]                     [⤴] │  ← botões flutuantes
│   ░░░ cover (foto categ.) ░░│
│                             │
│  ◯ Profissional ✓           │  ← avatar 80px, alinhado esq.
│    📍 Águas Claras           │
│    [Marido] [Reparos] +3     │  ← chips compactos
│                             │
│  Sobre                      │
│  Ksjsjajahahxhncnznzn       │
│                             │
│  ✨ Serviços oferecidos      │
│  ┌──────┐ ┌──────┐          │
│  │ foto │ │ foto │          │  ← vitrine visual
│  │Marido│ │Reparo│          │
│  └──────┘ └──────┘          │
│  ┌──────┐ ┌──────┐          │
│  │ foto │ │ foto │          │
│  └──────┘ └──────┘          │
│                             │
│  📷 Portfólio (se houver)   │
│                             │
├─────────────────────────────┤
│  [📅 Agendar agora]          │  ← bottom bar fixa
└─────────────────────────────┘
```

Sem footer "Tribo Serviços / Produto / Suporte". Sem "P" gigante. Sem chips repetidos.

## Arquivos afetados

- `src/features/motorista/pages/pagina_perfil_motorista.tsx` (refatorado)
- `src/features/triboservicos/pages/pagina_perfil_profissional_servicos.tsx` (remover footer)
- `src/features/triboservicos/components/cabecalho_perfil_profissional.tsx` (avatar menor em mobile)
- `src/features/motorista/components/secao_especialidades_publica.tsx` e `src/features/triboservicos/components/vitrine_especialidades_visuais.tsx` (consolidar em um componente compartilhado)
- (não tocar) `FooterServicos` continua existindo, só deixa de ser usado nas páginas de prestador

## Fora do escopo desta rodada

- Reativar avaliações/distribuição de notas em formato "app" (cards minimalistas) — pode entrar depois.
- Botão de "Adicionar serviço" — esse só faz sentido no painel logado, e ele já está lá; nada a fazer na página pública.
- PWA, offline, ícones — já configurado em rodada anterior.
