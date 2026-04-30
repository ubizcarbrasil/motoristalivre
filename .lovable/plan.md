Identifiquei dois problemas prováveis:

1. A tribo `gina` ainda não existe no banco após a limpeza da órfã, então `/s/gina` e `/gina` retornam “Tribo/Link não encontrado” até o onboarding ser concluído.
2. A tela “Meus Links” ainda gera o link do grupo como `/{slug}`, que abre o fluxo antigo de corridas. Para tribos de serviços, o link correto da vitrine é `/s/{slug}`. Isso explica a confusão entre “Link não encontrado” e “Tribo não encontrada”.

Plano de correção:

1. Corrigir geração dos links públicos
   - Em `src/features/painel/services/servico_meus_links.ts`, alterar o canal “Link do grupo” quando a tribo/profissional for de serviços para gerar `/s/{tenantSlug}`.
   - Manter link de corrida em `/{tenantSlug}/{driverSlug}` somente para profissionais que atendem corridas.
   - Manter link de serviço profissional em `/s/{tenantSlug}/{driverSlug}`.

2. Ajustar a aba “Meus Links” para usar a tribo ativa
   - Hoje ela recebe `tenant`, que vem do `users.tenant_id`; em cenários multi-tenant/dono de tribo isso pode não ser a tribo selecionada.
   - Passar `triboAtiva` para a aba quando existir, garantindo que os links sejam gerados com o slug correto, como `gina`.

3. Melhorar o caso “dono de tribo sem perfil de motorista”
   - Permitir acesso à aba de links do grupo mesmo sem perfil de motorista, quando o usuário é dono da tribo.
   - Exibir pelo menos o “Link da vitrine de serviços” (`/s/gina`) para o dono copiar/compartilhar.

4. Melhorar mensagens de erro nas vitrines
   - Em `/s/:slug`, trocar a mensagem genérica por uma explicação mais útil quando a tribo não existe:
     - “Tribo não encontrada”
     - “Conclua o onboarding ou verifique se o slug foi criado.”
   - Isso evita parecer erro de rota quando, na verdade, falta registro no banco.

5. Garantir persistência correta do branding no onboarding
   - Atualizar `src/features/onboarding/services/servico_onboarding.ts` para salvar `primary_color` em `tenant_branding` se o fluxo já estiver capturando esse campo.
   - Caso o campo de cor ainda não esteja na etapa de identidade, adicionar o campo de cor primária de forma simples e refletir no resumo final.

6. Validar o estado da Gina após aprovação
   - Conferir se `gina` foi criada em `tenants` e se existe linha correspondente em `tenant_branding`.
   - Se ainda não existir, orientar o fluxo correto: entrar/cadastrar, ir para `/onboarding?fluxo=solo&modulo=services`, preencher slug `gina` e concluir.

Resultado esperado:
- O painel passa a mostrar o link correto da vitrine: `/s/gina`.
- Links de serviço não caem mais no fluxo antigo de corridas.
- Se a Gina ainda não tiver sido criada, a mensagem ficará clara e o onboarding salvará os dados necessários em `tenants` e `tenant_branding`.