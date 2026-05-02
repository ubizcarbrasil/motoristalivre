## O problema real

Você está certo. O erro agora não é validação de categoria. O problema é que a conta já foi configurada como **profissional de serviços**, mas o painel continua usando a estrutura antiga de **motorista/mobilidade urbana**.

Do I know what the issue is? Sim.

O código atual usa `activeModules` da tribo para decidir o que mostrar. Como a tribo ainda tem `mobility` ativo, várias partes continuam aparecendo mesmo quando o `professional_type` do usuário é `service_provider`:

- Início: “Solicitar corrida”, “Corridas”, “Nenhuma corrida recente”, status de chamada
- Perfil: campos “Veículo”, “Ano”, “Cor”, “Placa”
- Configurações: “Bandeira”, “Preço por km”, “Preço por minuto”, “Regras do meu link”, “ID do motorista logado”, “simulador de dispatch”
- Gestão da tribo: “Motoristas”, “Corridas”, “Motoristas online”, “Afiliados ativos hoje”, métricas de corridas

Ou seja: o painel está parcialmente modularizado, mas ainda não existe um **modo de experiência** separado para “Profissional de serviços”.

## Correção proposta

### 1. Criar uma decisão única de modo do painel
Criar uma utilidade em `src/features/painel/utils/` para resolver o modo visual:

```text
professional_type = service_provider  -> modo serviços
professional_type = driver            -> modo mobilidade
professional_type = both              -> modo híbrido
```

A regra principal será: se o usuário é `service_provider`, a tela dele deve priorizar serviços mesmo que a tribo tenha mobilidade ativa.

### 2. Ajustar a tela inicial do profissional
Arquivos principais:
- `src/features/painel/components/aba_inicio.tsx`
- `src/features/painel/components/acesso_rapido.tsx`
- `src/features/painel/components/grid_stats.tsx`
- `src/features/painel/components/lista_corridas.tsx`

Mudanças:
- Trocar “Solicitar corrida” por ação de serviços, como “Ver minha vitrine” ou “Novo agendamento”
- Remover cards de “Corridas” quando for modo serviços
- Trocar estatísticas para contexto de serviços:
  - Faturamento
  - Agendamentos
  - Serviços ativos
  - Avaliação
- Trocar “Nenhuma corrida recente” por “Nenhum agendamento recente”
- Não mostrar dispatch/corrida/localização para profissional só de serviços

### 3. Corrigir aba Perfil
Arquivo:
- `src/features/painel/components/aba_perfil.tsx`

Mudanças:
- Se `professional_type === service_provider`, esconder completamente:
  - Veículo
  - Ano
  - Cor
  - Placa
- Ajustar placeholder da Bio para serviços: “Descreva seus serviços, experiência e diferenciais...”
- Manter esses campos apenas para motorista ou ambos

### 4. Corrigir aba Configurações
Arquivo:
- `src/features/painel/components/aba_configuracoes.tsx`

Mudanças para modo serviços:
- Remover seções de mobilidade:
  - `SecaoMeuPreco` com bandeira/km/minuto
  - `SecaoRegrasLink` de corrida/despacho
  - Som de chamada de corrida quando não fizer sentido
  - Botão “Testar alerta de chamada” com texto de corrida
  - “ID do motorista logado” e texto de simulador de dispatch
- Priorizar blocos de serviços no topo:
  - Meus serviços
  - Disponibilidade
  - Categorias visíveis
  - Portfólio
  - Equipe
  - Preview da vitrine
- Trocar textos de “chamadas” para “agendamentos” onde for serviço
- Trocar “Grupos e rede / corridas/mês” por “Tribo e rede / agendamentos/mês” quando estiver em modo serviços

### 5. Corrigir navegação inferior e atalhos
Arquivos:
- `src/features/painel/components/navegacao_inferior.tsx`
- `src/features/painel/components/acesso_rapido.tsx`
- `src/features/painel/utils/abas_por_modulo.ts`

Mudanças:
- Em modo serviços, “Links” continua disponível, mas com foco em link de serviços
- Atalhos passam a ser:
  - Vitrine
  - Serviços
  - Agenda
  - Perfil
  - Instalar app
- Remover atalho de corrida para profissional de serviços

### 6. Corrigir painel de gestão da tribo
Arquivos:
- `src/features/painel/components/aba_tribo.tsx`
- `src/features/admin/components/secao_dashboard.tsx`
- Possivelmente `src/features/admin/components/secao_motoristas.tsx`
- `src/features/admin/types/tipos_admin.ts`

Mudanças:
- Para tribo/módulo serviços, trocar linguagem:
  - “Motoristas” -> “Profissionais”
  - “Corridas” -> “Agendamentos” ou esconder se ainda não houver seção pronta
  - “Motoristas online” -> “Profissionais ativos” ou “Profissionais disponíveis”
  - “Afiliados ativos hoje / corridas” -> texto neutro ou ocultar se for exclusivo de mobilidade
- Esconder subabas exclusivamente de mobilidade quando a experiência for serviços
- Garantir que a tela “Gerir tribo” de serviços não pareça um painel de transporte

### 7. Ajustar labels antigos sem quebrar banco
Importante: tecnicamente a tabela ainda chama `drivers`, porque o sistema começou com motoristas. Não vou mexer no schema agora para evitar risco. A correção será na camada de produto/UI:

```text
Banco: drivers
UI em modo serviços: profissionais / prestadores / equipe
UI em modo mobilidade: motoristas / corridas
```

### 8. Segurança e dados
Não será necessário abrir dados públicos nem alterar RLS. As queries atuais continuam respeitando as políticas existentes. A correção é de apresentação/experiência e filtragem de telas, não de permissão.

## Resultado esperado

Quando você entrar como profissional/prestador de serviços:

- Não aparece mais “Solicitar corrida”
- Não aparece mais “Corridas” como métrica principal
- Não aparece mais formulário de veículo/placa
- Não aparece mais preço por km, bandeira ou minuto
- Não aparece “ID do motorista logado”
- Não aparece “simulador de dispatch”
- A gestão da tribo deixa de parecer app de transporte e passa a parecer painel de serviços/agendamentos

Quando entrar como motorista de mobilidade, a experiência antiga continua funcionando.

Quando o profissional for `both`, mantenho uma experiência híbrida mostrando os dois contextos, mas separados por seção para não misturar.

<lov-actions>
  <lov-open-history>View History</lov-open-history>
</lov-actions>

<lov-actions>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>