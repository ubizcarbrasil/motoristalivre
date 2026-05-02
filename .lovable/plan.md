Vou corrigir isso de forma mais definitiva, não só trocar texto pontual.

Plano de implementação:

1. Travar o modo visual em `servicos` no painel
- Passar o `modo` resolvido pelo `resolverModoPainel(...)` para `AbaConfiguracoes`, `NavegacaoInferior` e demais partes internas que ainda dependem só de `activeModules`.
- Remover a brecha atual em que `AbaConfiguracoes` inicia com `professionalType = driver` pelo hook e renderiza temporariamente/preferencialmente blocos de mobilidade.
- Resultado esperado: conta de serviço não verá mais “Bandeira”, “Preço por km”, “Preço por minuto”, “Cashback para passageiro”, “Regras do meu link”, “transbordo”, “dispatch”, “motoristas online” etc.

2. Reorganizar a aba Config para profissional de serviços
- Em modo serviços, a tela deve começar direto com blocos úteis de serviço:
  - cadastro/onboarding profissional pendente;
  - meus serviços;
  - disponibilidade/agenda;
  - categorias;
  - portfólio;
  - equipe;
  - preview da vitrine;
  - instalar app;
  - tribo e rede.
- Esconder 100% das seções de mobilidade:
  - `SecaoMeuPreco`;
  - `SecaoRegrasLink`;
  - seletor de som de chamada de corrida;
  - botão “Testar alerta de chamada”;
  - “ID do motorista logado”;
  - simulador de dispatch;
  - tipo “Somente motorista”.

3. Ajustar textos remanescentes no painel profissional
- Trocar mensagens como:
  - “começar a receber corridas” → “começar a receber agendamentos” quando for serviço;
  - “clientes ou passageiros” → “clientes” no modo serviços;
  - “grupo” quando fizer sentido → “tribo/rede profissional”;
  - “Somente motorista” escondido ou substituído conforme contexto.
- Revisar `AbaMeusLinks`, `GuiaLinksRapido`, `TelaAguardandoAprovacao`, `DialogoOnboardingProfissional`, `NavegacaoInferior` e cards auxiliares.

4. Blindar componentes de mobilidade contra renderização em serviços
- Manter `SecaoMeuPreco` e `SecaoRegrasLink` como componentes de mobilidade, mas impedir que apareçam em modo serviços.
- Também vou deixar os textos internos mais seguros caso algum dia sejam reaproveitados, evitando vazamento de “passageiro”, “corrida” e “transbordo” fora do contexto correto.

5. Melhorar a tela pública do cliente em serviços
- Revisar a tela de agendamento (`AgendamentoServico`) para ficar com cara de serviço/profissional, não reaproveitada de passageiro/mobilidade.
- Ajustar textos, hierarquia e estados vazios:
  - “Escolha o serviço”;
  - “Escolha a data”;
  - “Horários disponíveis”;
  - “Seus dados”;
  - confirmação de agendamento.
- Melhorar a experiência mobile da tela do cliente: cabeçalho, resumo fixo, CTA e espaçamentos, mantendo o design system dark/premium.

6. Remover referência pública confusa a mobilidade no rodapé de serviços
- No footer de `TriboServiços`, remover ou suavizar “TriboCar Mobilidade”, porque no fluxo de serviços isso está reforçando a sensação de produto errado.
- Manter a marca como família/plataforma, sem chamar atenção para mobilidade dentro da jornada de serviços.

7. Auditar páginas internas e sidebar/admin novamente
- Rodar uma busca final por termos visíveis em componentes de painel/admin/serviços:
  - motorista(s)
  - corrida(s)
  - passageiro(s)
  - bandeira
  - preço por km
  - transbordo
  - dispatch
- Separar o que é código interno/tipagem legado do que é texto visível ao usuário.
- Corrigir apenas os textos visíveis no contexto de serviços, sem quebrar o fluxo real de mobilidade.

Arquivos principais que pretendo alterar:
- `src/features/painel/pages/pagina_painel.tsx`
- `src/features/painel/components/aba_configuracoes.tsx`
- `src/features/painel/components/secao_meu_preco.tsx`
- `src/features/painel/components/secao_regras_link.tsx`
- `src/features/painel/components/aba_meus_links.tsx`
- `src/features/painel/components/guia_links_rapido.tsx`
- `src/features/painel/components/tela_aguardando_aprovacao.tsx`
- `src/features/painel/components/dialogo_onboarding_profissional.tsx`
- `src/features/passageiro/components/agendamento_servico.tsx`
- `src/features/triboservicos/components/footer_servicos.tsx`
- possivelmente `src/features/servicos/pages/pagina_servicos_motorista.tsx` para remover o fallback “link de corrida”.

Critério de aceite:
- Em conta/tribo de serviços, a aba Config não pode exibir nenhuma configuração de corrida.
- Sidebar/abas/páginas internas em modo serviços devem falar em profissionais, serviços, agenda e agendamentos.
- A tela pública do cliente deve parecer uma tela de agendamento de serviços, não um pedaço adaptado do app de corrida.
- O fluxo de mobilidade deve continuar funcionando quando o modo for mobilidade ou híbrido.