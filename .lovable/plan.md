## Diagnóstico — por que está feio

Olhei o código e o banco. Os problemas são reais e cumulativos:

**1. A foto do perfil até pode aparecer, mas o banner é praticamente impossível de aparecer hoje.**
- `avatar_url` vem da tabela `users` (existe e é populado pelo Google OAuth).
- `cover_url` está na tabela `drivers`, mas **não existe NENHUMA tela no app que permita ao profissional fazer upload de banner**. Resultado: `cover_url` é sempre `null` e o app cai no fallback Unsplash genérico.
- Também não existe tela de troca de avatar dentro do app — o avatar só existe se veio do Google.

**2. O visual realmente não tem cara de app de serviço.**
- Cover de só 176px, com gradiente preto cobrindo metade — a foto vira um borrão.
- Avatar pequeno (80px) jogado no canto esquerdo, sem destaque.
- Nome em peso médio, badges cinza pequenos — hierarquia fraca.
- Bio, serviços e equipe empilhados em cards genéricos do shadcn, sem personalidade.
- Sem rating em destaque, sem chip "Verificado", sem cidade visível em destaque.
- Footer fixo de CTA isolado, sem reforço de confiança acima.

**3. Tokens fora do design system em pontos pontuais** (ex.: `bg-secondary` cinza no placeholder de cover e `bg-primary/10` no fallback de avatar não casam com o accent verde TriboCar #1db865 sobre preto puro).

## O que vou fazer

### Etapa 1 — Permitir que o profissional realmente tenha foto e banner

1. Criar bucket `perfis-profissionais` no storage (público, com RLS de upload restrito ao próprio profissional).
2. Adicionar coluna `avatar_url` em `drivers` (override do avatar do Google quando o profissional escolher uma foto profissional dedicada).
3. Criar tela **"Editar perfil público"** dentro de `src/features/configuracoes` (feature nova) com:
   - Upload de **foto de perfil** (crop circular 1:1, máx 2MB).
   - Upload de **banner** (16:9, máx 5MB, sugestão de imagem horizontal).
   - Edição de bio, cidade, categorias.
   - Preview ao vivo de como vai aparecer na página pública.
4. Atualizar `hook_perfil_motorista` para priorizar `drivers.avatar_url` sobre `users.avatar_url`.

### Etapa 2 — Refazer a página pública estilo iFood/Rappi

Refatorar `pagina_perfil_motorista.tsx` em componentes próprios, todos em `src/features/motorista/components/perfil_publico/`:

```
hero_perfil.tsx          — banner 240px + avatar 96px sobreposto
identidade_perfil.tsx    — nome XL + verified + cidade + rating destaque
chips_categorias.tsx     — pílulas de categoria com ícone
bloco_confianca.tsx      — "X anos no app", "Y atendimentos", "Z avaliações"
secao_bio_premium.tsx    — bio com tipografia editorial
barra_acao_fixa.tsx      — CTA + botão WhatsApp secundário
```

Mudanças visuais concretas (vibe iFood/Rappi):
- **Banner cheio** (240px mobile / 320px desktop), foto cobrindo 100%, gradiente sutil só na base.
- **Avatar grande** (96px mobile / 128px desktop) com ring verde accent.
- **Nome em XL bold** com ícone de verificado verde ao lado.
- **Rating em destaque** ao lado do nome (★ 4.9 · 127 avaliações) — quando houver.
- **Chips de categoria coloridos** (verde claro sobre fundo escuro), não badges cinza.
- **Linha de confiança** logo abaixo: "Verificado · X meses no app · Y atendimentos".
- **Cards com bordas arredondadas 16px**, fundo `#0a0a0a` (não `bg-card` shadcn padrão), sombra interna sutil.
- **Footer CTA** com botão verde pulsante e botão WhatsApp secundário lado a lado.

### Etapa 3 — Fallbacks dignos quando não há foto

- Avatar sem foto: gerar avatar gradiente verde→preto com inicial em IBM Plex tamanho grande, em vez do cinza atual.
- Banner sem foto: continuar com Unsplash por categoria, mas com **overlay verde sutil + textura sutil** para parecer intencional, não um stock genérico solto.

## Detalhes técnicos

**Migrations necessárias:**
- `ALTER TABLE drivers ADD COLUMN avatar_url text;`
- Criar bucket `perfis-profissionais` público.
- RLS: insert/update/delete só pelo próprio driver (`auth.uid() = (storage.foldername(name))[1]::uuid`).

**Padrão de path no bucket:** `{driver_id}/avatar.jpg` e `{driver_id}/cover.jpg`.

**Upload:** usar `supabase.storage.from('perfis-profissionais').upload()` com `upsert: true`. Após upload, salvar a public URL na coluna correspondente em `drivers`.

**Crop:** usar `react-easy-crop` (já é prática comum em apps tipo iFood) para garantir proporção certa.

**Componentização:** seguir feature-based como manda o workspace, em snake_case pt-BR, com hook próprio `hook_editar_perfil_publico.ts` e service `servico_perfil_publico.ts`.

## Ordem de implementação

1. Migration + bucket + RLS.
2. Tela de edição de perfil (upload de avatar + banner + bio + cidade).
3. Refatoração visual da página pública em componentes pequenos.
4. Fallbacks bonitos.
5. Teste end-to-end: subo uma foto real, vejo o resultado na rota pública.

## O que não vou fazer agora

- Reviews/rating real (a UI já mostra quando existe; integração real fica pra depois).
- Edição de portfólio (já existe componente separado).
- Gestão de equipe (já existe).

Posso começar?