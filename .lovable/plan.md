Você tem razão: ainda existem dois problemas reais no painel:

1. O modo “serviços” ainda está sendo decidido em alguns lugares só por `active_modules` da tribo. Na sua tribo `Papa-léguas`, o banco mostra `active_modules = ["mobility", "services"]`, então o admin continua caindo em modo mobilidade, mesmo o dono estando como `professional_type = service_provider`.
2. Alguns componentes ainda têm textos fixos de mobilidade, especialmente Perfil, Dashboard da tribo, convites do onboarding e módulos.

Plano de correção:

## 1. Centralizar o modo serviços também no admin da tribo
Vou parar de deixar `SecaoDashboard`, `SecaoMotoristas`, `SecaoCorridas`, `SecaoCRM` e `SecaoRegras` decidirem sozinhos se é mobilidade ou serviços apenas pela tribo.

A `AbaTribo` já recebe a tribo ativa e o perfil do usuário está disponível no painel. Vou passar um modo visual explícito para as seções admin:

```text
professional_type = service_provider -> modo serviços
professional_type = driver -> modo mobilidade
professional_type = both -> modo híbrido
tribo só services -> modo serviços
tribo só mobility -> modo mobilidade
```

Na sua situação, mesmo com a tribo tendo `mobility + services`, o painel de gestão vai usar serviços porque o usuário é `service_provider`.

## 2. Corrigir a aba Perfil para esconder veículo/ano/cor/placa no modo serviços de verdade
O componente já tenta esconder esses campos, mas ele depende do `perfil.professional_type` carregado no estado. Vou reforçar isso usando o modo visual resolvido no painel e passar esse modo para `AbaPerfil`.

Resultado esperado:

- não aparece “Veículo”
- não aparece “Ano”
- não aparece “Cor”
- não aparece “Placa”
- o salvamento do perfil em modo serviços não fica tentando persistir dados de veículo

## 3. Corrigir Dashboard da tribo em modo serviços/híbrido priorizado
Na tela mostrada nos prints, vou trocar/ocultar:

- “Corridas hoje” -> “Agendamentos hoje”
- ícone de carro -> ícone de calendário/serviços
- “Motoristas online” -> “Profissionais ativos” ou “Profissionais disponíveis”
- “0 corridas” -> “0 agendamentos”
- seção “Afiliados ativos hoje” será ocultada quando a experiência for serviços
- “Comissões hoje” será removido do resumo de serviços, mantendo foco em Receita, Agendamentos, Serviços ativos, Profissionais e Clientes/Tribo

## 4. Corrigir abas da gestão da tribo
Na barra superior da gestão da tribo:

- “Motoristas” -> “Profissionais”
- ícone de carro -> ícone de maleta/serviços
- “Corridas” -> “Agendamentos”
- ícone de rota -> ícone de calendário
- “Afiliados” e “Comissões” não aparecem quando a experiência for serviços, mesmo se o módulo mobility ainda existir na tribo

Isso corrige exatamente os prints onde aparecem “Motoristas” e “Corridas”.

## 5. Corrigir seções admin internas
Vou atualizar as seções para aceitarem o modo resolvido pela `AbaTribo`:

- `secao_motoristas.tsx`: título/empty/table/mobile sempre “Profissionais” e “Agendamentos” em modo serviços
- `secao_corridas.tsx`: sempre buscar e renderizar `service_bookings` quando o modo visual for serviços
- `secao_crm.tsx`: usar “Agendamentos/Atendimentos” sem herdar texto de corrida
- `secao_regras.tsx`: esconder despacho, raio, motorista responder, preços por motorista e ofertas de passageiros quando modo serviços

## 6. Corrigir onboarding de convites para tribo de serviços
No print de convites ainda aparece:

- “adicionar motoristas e afiliados”
- “Link para motoristas”
- “Envie para motoristas...”
- “Link para afiliados”/“passageiros”

Vou passar os módulos selecionados para `EtapaConvites` e, quando for serviços:

- “Convide sua equipe” continua
- texto vira “adicione profissionais ao seu grupo”
- “Link para motoristas” -> “Link para profissionais”
- descrição -> “Envie para profissionais/prestadores que desejam se cadastrar no grupo”
- link usa tipo profissional, não motorista
- esconder afiliados quando não houver mobilidade

## 7. Corrigir botão/card de ativação de motorista para donos em modo serviços
`CardAtivarMotorista` ainda é 100% mobilidade (“Receber corridas”, “modo motorista”, ícone de carro). Vou garantir que ele não apareça em experiência de serviços, ou adaptar para “Completar perfil profissional” se fizer sentido no contexto.

## 8. Corrigir dados existentes da sua tribo se necessário
Pelo banco, sua tribo `Papa-léguas` está com os dois módulos ativos: `mobility` e `services`. Isso é a causa de muita UI cair em mobilidade.

Vou implementar a correção de UI para não depender apenas disso. Além disso, se for apropriado, vou ajustar a criação/fluxo para tribos de serviços não manterem `mobility` ativo por padrão quando o onboarding veio de serviços.

Não vou renomear tabelas internas como `drivers` porque isso é schema legado. A correção será na experiência visual e nos dados de módulo/tipo profissional.

## Validação final
Depois da implementação, vou auditar com busca textual nos arquivos de painel/admin/onboarding para garantir que ocorrências de:

```text
Motoristas, motoristas, Corridas, corridas, Veículo, Placa, despacho, motorista online, corridas hoje
```

não aparecem mais em telas de modo serviços, ficando apenas em código ou telas exclusivas de mobilidade.