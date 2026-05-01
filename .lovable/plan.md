# Diagnóstico do problema com o seu link

Você compartilhou: `https://gina.tribocar.com/cadastro?tipo=motorista`

Existem **três problemas** acontecendo ao mesmo tempo:

### 1. Subdomínio `gina.tribocar.com` não está configurado
O sistema só conhece os domínios:
- `motoristalivre.lovable.app` (publicado)
- `www.motoristalivre.com.br` (custom domain)

Subdomínios por tenant tipo `gina.tribocar.com` **não existem na infra**. O cliente cai num site desconhecido e nem chega na sua tribo.

### 2. O link estava errado para "cliente"
Você quis enviar para um **cliente final** (passageiro/agendamento), mas a URL era `/cadastro?tipo=motorista` — uma tela de cadastro **de motorista**, não de cliente. O cliente nunca deveria ver isso.

### 3. Há rotas demais e duplicadas para a mesma coisa
Hoje temos rotas concorrentes para serviços:

```text
/:slug/servicos                 ← antigo (mobilidade + serviços misturados)
/:slug/servicos/:driver_slug    ← antigo
/s/:slug                        ← novo (TriboServiços)
/s/:slug/:driver_slug           ← novo
/s/:slug/:driver_slug/agendar   ← novo
```

Isso confunde quem compartilha e quem recebe.

---

# Plano de revisão

## Etapa 1 — Corrigir o link que você compartilha hoje

Em **Painel → Meus Links**, hoje só existem 2 cards (corrida e afiliado). Vou:

- **Adicionar um terceiro card "Link de Serviços"** para profissionais com `professional_type = service_provider | both`, apontando para `/s/{tenantSlug}/{driverSlug}` (perfil público de serviços, com botão "Agendar agora").
- Renomear textos para deixar claro **para quem é cada link**:
  - 🟣 Link de corrida → "Para passageiros pedirem corrida"
  - 🔵 Link de afiliado → "Para indicar corridas e ganhar comissão"
  - 🟡 Link de serviços → "Para clientes verem portfólio e agendar"

## Etapa 2 — Unificar rotas de serviço

**Manter apenas o prefixo `/s/`** (TriboServiços) como rota oficial:

```text
/s                              → landing institucional
/s/entrar                       → login
/s/cadastro/tribo               → cadastro de operador (dono de tribo)
/s/cadastro/profissional        → cadastro de profissional solo
/s/:slug                        → vitrine pública da tribo
/s/:slug/:driver_slug           → perfil + portfólio do profissional
/s/:slug/:driver_slug/agendar   → fluxo de agendamento
```

**Aposentar as rotas antigas** (`/:slug/servicos` e `/:slug/servicos/:driver_slug`) com **redirect 301-style** (`<Navigate replace>`) para as novas equivalentes em `/s/...`. Assim links antigos continuam funcionando.

## Etapa 3 — Resolver o `gina.tribocar.com`

Subdomínio por tenant **não é viável sem configuração de infra** (DNS wildcard + provisionamento SSL para cada tribo). Duas opções:

- **Opção A (recomendada, imediata):** Não usar subdomínios. Seu link da Gina passa a ser:
  `https://www.motoristalivre.com.br/s/gina` (vitrine de serviços)
  ou `https://www.motoristalivre.com.br/gina` (mobilidade)
  Isso já funciona hoje, é o formato que o painel "Meus Links" gera, e é o caminho mais sólido.

- **Opção B (futura):** Configurar wildcard DNS `*.tribocar.com` + reescrita no front para mapear `gina.tribocar.com` → `/s/gina`. Exige mudança de DNS do domínio `tribocar.com` apontando para Lovable e provisionamento de SSL wildcard. Pode ser feito depois.

Sigo com a **Opção A** agora. Se quiser a Opção B no futuro, abrimos como tarefa separada.

## Etapa 4 — Mensagem clara na tela de cadastro

Hoje `/cadastro` aceita `?tipo=motorista|passageiro|afiliado|profissional|grupo`. Vou:
- Adicionar um **alerta amigável** quando alguém cair em `?tipo=motorista` sem ser convidado, lembrando que "este cadastro é para motoristas que vão atender corridas; se você é cliente, peça o link correto ao profissional".
- Bloquear cadastro de motorista sem `slug` da tribo (já bloqueado, mas com mensagem mais clara).

## Etapa 5 — Mapa visual no painel

Criar uma seção pequena no topo da aba "Meus Links" mostrando:

```text
👤 Cliente quer agendar  →  /s/sua-tribo/seu-slug
🚗 Passageiro quer corrida →  /sua-tribo/seu-slug
🤝 Quer indicar corridas  →  /sua-tribo/a/seu-slug
```

Para você nunca mais errar qual link mandar.

---

# Detalhes técnicos

**Arquivos afetados:**
- `src/App.tsx` — adicionar redirects das rotas antigas `/:slug/servicos*` para `/s/:slug*`.
- `src/features/painel/services/servico_meus_links.ts` — adicionar canal "servicos" condicional.
- `src/features/painel/types/tipos_meus_links.ts` — incluir tipo `"servicos"` e cor `"dourado"`.
- `src/features/painel/components/card_link_canal.tsx` — suportar nova cor.
- `src/features/painel/components/aba_meus_links.tsx` — passar `professionalType` para filtrar canais.
- `src/features/painel/hooks/...` — se houver hook de perfil, garantir que `professional_type` é carregado (já existe em `drivers`).
- `src/features/autenticacao/pages/pagina_cadastro.tsx` — alerta contextual em `?tipo=motorista`.
- `src/features/painel/components/aba_meus_links.tsx` — bloco "guia rápido" no topo.

**Sem mudanças de banco** — já temos `drivers.professional_type` e todas as colunas necessárias.

**Sem mudanças de DNS** — fica para uma fase futura, se realmente quiser subdomínios.

Quando aprovar, eu implemento as etapas 1, 2, 4 e 5 numa única passagem.
