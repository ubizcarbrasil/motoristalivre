## Diagnóstico

Investiguei seu perfil no banco (Alecio Cavalcante / `papalegua`) e encontrei o seguinte:

| Item | Status no banco |
|---|---|
| Perfil (nome, bio, avatar, capa) | OK — salvo |
| `service_categories` (especialidades — chips) | OK — 5 itens salvos |
| `service_types` (serviços vendáveis com preço/duração) | **0 registros** |
| `service_portfolio_items` (imagens de portfólio) | **0 registros** |

**Conclusão importante:** a página pública NÃO está com bug nem está perdendo dados. Ela está mostrando exatamente o que existe no banco. O que aconteceu é que você cadastrou apenas as **especialidades** (chips/categorias do onboarding), mas **nunca cadastrou nenhum serviço vendável** (com preço, duração, descrição) nem subiu imagens de portfólio. Por isso aparece "Este profissional ainda não publicou serviços" e "ainda não publicou trabalhos no portfólio".

Hoje existem 3 conceitos diferentes — e isso está confundindo:

1. **Especialidades** (chips "Marido de aluguel", "Pequenos reparos"…): só uma etiqueta visual, não tem preço.
2. **Serviços oferecidos** (cards com "Agendar"): item vendável com nome, duração e preço. É o que o cliente contrata.
3. **Portfólio**: fotos de trabalhos feitos.

Você só preencheu o item 1.

## O que vou fazer

O problema é metade falta de UX, metade falta de dados. Vou atacar os dois lados.

### 1. Tornar a página pública útil mesmo sem serviços vendáveis cadastrados

Em `pagina_perfil_motorista.tsx` e `secao_servicos_publica.tsx`:

- Quando não houver serviços vendáveis cadastrados, mas houver **especialidades** (`service_categories`), exibir as especialidades como cards clicáveis com um botão **"Solicitar orçamento"** que abre WhatsApp/chat com o profissional. Hoje cai num vazio "ainda não publicou serviços" — fica inutilizável.
- Botão fixo inferior: trocar "Agendar serviço" por **"Solicitar orçamento"** quando não há serviços vendáveis com preço (em vez de levar para uma agenda vazia).
- Mostrar nome do profissional no header sticky (hoje só aparece "Perfil") — no print 1 dá pra ver que ficou genérico.

### 2. Corrigir o painel do profissional para deixar claro o que falta

Em `aba_perfil.tsx` e/ou `banner_onboarding_profissional.tsx`:

- Adicionar um **checklist de publicação** no topo do painel:
  - [x] Perfil preenchido
  - [x] Especialidades selecionadas
  - [ ] **Pelo menos 1 serviço cadastrado com preço** ← bloqueia agendamento
  - [ ] **Pelo menos 1 foto no portfólio** ← recomendado
- Cada item incompleto vira um botão que rola até a seção correta.
- Renomear "Adicionar serviço" para **"Adicionar serviço com preço"** e adicionar um subtítulo curto: *"Para que clientes possam agendar e pagar, cadastre serviços com nome, duração e valor."*

### 3. Onde ver os serviços já ativos

Os serviços ativos aparecem no painel, aba **Perfil → seção "Meus serviços"**, com um Switch para ativar/desativar e botão de remover. Vou:

- Renomear a seção para **"Meus serviços ativos"**.
- Mostrar contador ("3 ativos · 1 pausado").
- Adicionar link "Ver como o cliente vê" que abre o preview da vitrine (já existe o componente `BotaoPreviewVitrine`, só falta destacar).

### 4. Imagens (avatar e capa) que você subiu

Confirmado no banco: avatar e capa **estão salvos e públicos**. Eles aparecem no `HeaderPerfil` da página pública. Os prints 1 e 2 mostram apenas as partes inferiores da página (após scroll), por isso parece que não há imagem — no print 3 dá para ver o avatar "P" porque está no preview do painel, não na página pública. Vou:

- Garantir que a capa (`cover_url`) seja exibida no topo do header da página pública mesmo no preview do painel.
- Adicionar no painel uma prévia visual de avatar e capa salvos, com botão "Trocar".

## Detalhes técnicos

**Arquivos a editar:**
- `src/features/motorista/pages/pagina_perfil_motorista.tsx` — fallback de "solicitar orçamento", header com nome
- `src/features/motorista/components/secao_servicos_publica.tsx` — usar `service_categories` como fallback
- `src/features/motorista/components/header_perfil.tsx` — confirmar render de cover_url
- `src/features/painel/components/aba_perfil.tsx` — checklist de publicação
- `src/features/painel/components/secao_meus_servicos.tsx` — copy melhorada, contador, link para preview
- `src/features/painel/components/banner_onboarding_profissional.tsx` — destacar ações pendentes

**Novo componente:**
- `src/features/painel/components/checklist_publicacao.tsx`

**Sem mudanças de banco** — não há migração necessária. Tudo é UX/copy/componentização sobre dados que já existem.

## Resumo direto das suas perguntas

- **"É isso mesmo a página do cliente?"** Sim, mas ela está vazia porque você só cadastrou especialidades (etiquetas), não cadastrou serviços vendáveis nem subiu portfólio.
- **"Como contrata o serviço?"** Hoje, só pelo botão "Agendar" que aparece em cada serviço vendável — e como você não tem nenhum cadastrado, não há como contratar. Vou adicionar fallback de "Solicitar orçamento" para não ficar inutilizável.
- **"Como ver os serviços que já ativei?"** Painel → aba Perfil → seção "Meus serviços". Vou deixar isso mais visível.
- **"Cadê as imagens que subi?"** Avatar e capa estão salvos e aparecem no topo da página pública (parte que ficou fora do print). Portfólio está vazio porque você não subiu nenhuma imagem de trabalho ainda.
