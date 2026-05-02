# Links, associados e espelhamento de profissionais

Vou resolver três lacunas que você apontou, mantendo a regra de que **cada profissional define seu próprio preço**.

## O que falta hoje

1. **Profissional puro de serviços não tem link de indicação (afiliado).** Hoje só corridas geram link de afiliado. Quem vive de serviços não consegue indicar clientes/colegas e ganhar comissão.
2. **No perfil público de serviços (`/s/:slug/:driver_slug`) não aparece a equipe (associados).** Só aparece em mobilidade. O cliente não vê os parceiros nem a agenda livre/ocupado deles.
3. **Espelhamento não é automático.** Quando A adiciona B na equipe, B continua sem mostrar A no perfil dele. Cada um precisa adicionar o outro manualmente, e cada um mantém sua tribo e suas regras (isso já é assim).
4. **Disponibilidade dos associados não é visível na vitrine de serviços.** O cliente precisa entrar no perfil do parceiro pra ver se ele está livre.

## O que vou construir

### 1. Link de indicação para serviços

Na seção **Meus links** do painel:

- Profissional **service_provider** ou **both** ganha um novo card **"Link de indicação de clientes"**: `/s/{tenant_slug}/a/{driver_slug}`. Quem entrar por esse link e fizer um agendamento conta como originado por ele.
- Profissional **driver** ou **both** mantém o link de afiliado de corridas como hoje.
- Estatísticas mensais agregam agendamentos originados (`origin_driver_id` em `service_bookings`) — receita, conversão, total de bookings.

A rota `/s/:slug/a/:driver_slug` carrega a vitrine pública do grupo já marcando o `origin_driver_id` na sessão, e os agendamentos feitos a partir dela são gravados com essa origem. A comissão de afiliado já existente em `tenant_settings.affiliate_commission` passa a valer também para serviços.

### 2. Associados aparecem no perfil público de serviços

Adiciono no `/s/:slug/:driver_slug`, abaixo do "Sobre o profissional", uma seção **"Equipe e parceiros"** que reaproveita o componente já existente. Para cada associado mostro:

- Foto, nome, especialidades.
- **Status agora**: "Disponível hoje" / "Ocupado" / "Sem agenda hoje", calculado a partir de `professional_availability` cruzado com `service_bookings` confirmados do dia.
- Link direto para o perfil do associado dentro do mesmo grupo.

### 3. Espelhamento bidirecional opcional

Quando o profissional A adiciona B como associado, ofereço um aviso: **"Adicionar você também na equipe de B?"**. Se A confirmar, dispara um convite pra B aceitar (sem auto-adicionar — preserva a autonomia de cada um sobre quem aparece no próprio perfil).

Cria-se a tabela `team_member_invites` (pendente / aceito / recusado). B vê o convite no painel dele e decide. Cada um continua dono da própria tribo, das próprias regras e dos próprios preços — só ganham visibilidade cruzada.

### 4. Indicação rápida nos cards de associados

No card de cada associado dentro do painel admin, adiciono botão **"Copiar link de indicação dele"** que gera o link de afiliado/serviços do parceiro. Útil pra recomendar um colega quando você não atende aquele tipo de serviço.

## Detalhes técnicos

```text
Banco
├── service_bookings.origin_driver_id     já existe — vou usar
├── service_bookings.origin_affiliate_id  já existe — vou usar
└── nova tabela: team_mirror_invites
    ├── inviter_driver_id  (quem propõe o espelhamento)
    ├── invitee_driver_id  (quem precisa aceitar)
    ├── tenant_id
    └── status: pending | accepted | declined

Frontend
├── features/painel/services/servico_meus_links.ts
│   └── novo canal "indicacao_servicos" (cor dourado)
├── features/triboservicos/pages/pagina_perfil_profissional_servicos.tsx
│   └── + SecaoEquipeServicos (com status livre/ocupado)
├── features/triboservicos/components/secao_equipe_servicos.tsx       (novo)
├── features/triboservicos/components/cartao_associado_status.tsx     (novo)
├── features/triboservicos/hooks/hook_status_disponibilidade.ts       (novo)
├── features/triboservicos/services/servico_origem_indicacao.ts       (novo)
│   └── grava origin_driver_id em sessionStorage ao abrir /s/.../a/...
└── features/painel/components/dialogo_espelhar_equipe.tsx            (novo)

RLS
├── team_mirror_invites: convidador e convidado leem; só convidado aceita.
└── service_bookings já tem RLS ok pra origem.
```

## O que NÃO muda

- Cada profissional continua dono dos preços dos próprios serviços (`service_types.price`).
- Cada profissional continua na sua tribo, com suas regras de comissão (`tenant_settings`).
- A relação de equipe permanece direcional por padrão — bidirecional só quando os dois aceitarem.
- Comissão de transbordo e cashback continuam configuráveis por tenant.

## Aprovações necessárias

Vou pedir aprovação para a migração que cria `team_mirror_invites` quando começar a implementar. Tudo o resto é código frontend/serviços usando tabelas e colunas que já existem.