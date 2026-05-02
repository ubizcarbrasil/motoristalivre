Vou corrigir isso como separação de fluxo, não só troca de texto. O problema está em três pontos: cadastro/onboarding ainda deixa o profissional virar “motorista”, rotas públicas legadas ainda caem na tela de corridas, e há dados legados como Maria Brasil com configuração de mobilidade apesar do uso como profissional.

Plano de execução:

1. Corrigir o cadastro de profissional
- Fazer `/profissional/cadastro` apontar para o cadastro dedicado de serviços (`/s/cadastro/profissional`) ou deixar o `/cadastro?tipo=profissional` sem opções de Motorista/Passageiro/Afiliado quando o tipo for profissional.
- Remover textos de “motorista”, “corridas”, “passageiro” e “grupo de motorista” do fluxo de cadastro profissional.
- Manter apenas linguagem de: profissional, serviços, agenda, portfólio, cliente e agendamentos.
- Garantir que profissional autônomo criado por esse fluxo já nasça com módulo `services` e tipo `service_provider`.

2. Travar o onboarding de perfil profissional em modo serviços
- No diálogo “Complete seu perfil profissional”, quando o usuário estiver em modo serviços puro, remover a escolha “Somente motorista” e “Ambos”.
- Em modo serviços puro, salvar automaticamente como `service_provider`.
- Evitar que um profissional de serviços consiga acidentalmente se transformar em motorista pelo onboarding.
- Ajustar validação e autosave para respeitar esse modo.

3. Corrigir dados legados que estão misturando Maria Brasil
- Aplicar migração para corrigir registros legados identificados:
  - `mariabrasil` deve ficar com módulo `services` quando for perfil profissional.
  - o perfil vinculado deve ficar como `service_provider`.
  - categorias de serviço devem continuar apenas no contexto de serviços.
- Também vou reforçar a função que cria/garante profissional para, em chamadas futuras, atualizar `active_modules` para `services` mesmo quando o tenant já existir.

4. Separar tela pública do cliente por módulo
- Hoje rotas legadas como `/:slug` e `/:slug/:driver_slug` ainda podem abrir a tela de corridas mesmo quando a tribo é de serviços.
- Vou criar/ajustar um resolvedor de rota pública:
  - tribo só de serviços → abre vitrine/agendamento de serviços;
  - tribo só de mobilidade → abre corrida/motoristas;
  - tribo híbrida → mantém seleção ou comportamento explícito.
- Assim, “coisas de corridas” não aparecem mais para um cliente acessando uma tribo/profissional de serviços.

5. Filtrar motoristas/profissionais corretamente nas listagens
- Na tela de cliente de mobilidade, listar apenas perfis `driver` ou `both`.
- Na vitrine de serviços, listar apenas `service_provider` ou `both`.
- Corrigir `buscarMotorista`/listagens para não puxar prestador puro como motorista.

6. Revisar painel e navegação inferior/sidebar
- Em modo serviços puro:
  - esconder/evitar “Meus links” de mobilidade quando não fizer sentido;
  - manter “Profissionais”, “Agendamentos”, “Serviços”, “Agenda”; 
  - remover labels residuais como “motorista”, “corridas”, “dispatch”, “passageiro” quando a tela está em services.
- Ajustar textos em Configurações como:
  - “ID do profissional” em vez de “ID do motorista”;
  - “testar alerta de agendamento/chamada” apenas quando aplicável;
  - “Criar minha própria tribo/rede” com linguagem de serviços.

7. Atualizar “Casa em condomínio fechado” no contexto correto
- Garantir que esse label apareça como categoria/subcategoria de serviços.
- Garantir que ele não apareça em fluxos de mobilidade.
- Revisar o seletor de categorias e os chips públicos para renderizarem o texto correto nas páginas internas e na vitrine.

8. Validar telas principais
- Conferir no preview mobile:
  - cadastro de profissional;
  - painel de profissional;
  - configurações/perfil profissional;
  - vitrine pública `/s/...`;
  - acesso público legado sem `/s`;
  - Maria Brasil após correção.

Arquivos principais que pretendo alterar:
- `src/App.tsx`
- `src/features/autenticacao/pages/pagina_cadastro.tsx`
- `src/features/triboservicos/pages/pagina_cadastro_profissional.tsx`
- `src/features/autenticacao/services/servico_criar_tribo_profissional.ts`
- `src/features/painel/components/dialogo_onboarding_profissional.tsx`
- `src/features/painel/services/servico_onboarding_profissional.ts`
- `src/features/passageiro/pages/pagina_passageiro.tsx`
- `src/features/passageiro/services/servico_passageiro.ts`
- `src/features/painel/components/*` relacionados a início/configurações/sidebar/admin
- `src/compartilhados/constants/constantes_categorias_servico.ts`
- nova migração para corrigir dados legados e reforçar módulo services.