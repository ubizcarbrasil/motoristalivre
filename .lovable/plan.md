`.

## Links de acesso

Olhando o roteamento em `src/App.tsx` e o que existe hoje no banco:

### 🚖 Motorista
O painel é unificado (motorista + afiliado) em `/painel`, atrás de login.

- **URL**: `https://motoristalivre.lovable.app/painel`
- Requer estar autenticado com um usuário cuja `role` seja `driver` (ou `affiliate`).
- Login: `/entrar` ou via Personas de dev em `/dev/personas`.

Já o **perfil público** de um motorista (página vista pelo passageiro antes de pedir corrida) segue o padrão `/{tenant_slug}/perfil/{driver_slug}`. Exemplos reais no banco:

- `https://motoristalivre.lovable.app/papalegua/perfil/carlos-silva`
- `https://motoristalivre.lovable.app/papalegua/perfil/ana-souza`
- `https://motoristalivre.lovable.app/demo/perfil/motorista-demo`

### 🧍 Passageiro
A tela do passageiro (mapa + solicitação de corrida) é pública e usa o slug do tenant, podendo opcionalmente apontar para um motorista específico ou link de afiliado:

| Cenário | Padrão de URL | Exemplo real |
|---|---|---|
| Tenant (lista de motoristas) | `/{tenant_slug}` | `https://motoristalivre.lovable.app/papalegua` |
| Motorista específico | `/{tenant_slug}/{driver_slug}` | `https://motoristalivre.lovable.app/papalegua/carlos-silva` |
| Via link de afiliado | `/{tenant_slug}/a/{affiliate_slug}` | `https://motoristalivre.lovable.app/papalegua/a/{slug-do-afiliado}` |

### Resumo rápido
- **Motorista (painel privado)** → `/painel`
- **Passageiro (público)** → `/{tenant_slug}` ou `/{tenant_slug}/{driver_slug}`

Os tenants ativos hoje são `papalegua` e `demo` (os outros — `tribofinal`, `teste` — ainda não têm motoristas cadastrados).

<lov-actions>
<lov-suggestion message="Abra a página do passageiro em /papalegua/carlos-silva no preview e confirme que o mapa e o botão de solicitar corrida carregam corretamente">Testar página do passageiro</lov-suggestion>
<lov-suggestion message="Crie uma tela /links no painel do motorista que liste e permita copiar todas as URLs públicas relacionadas a ele (perfil, link direto de corrida, link de afiliado)">Adicionar tela de links no painel</lov-suggestion>
<lov-suggestion message="Gere QR Codes reais (usando a lib qrcode) para cada link público do motorista, substituindo o placeholder atual no card_link_afiliado.tsx">Gerar QR Codes reais</lov-suggestion>
<lov-suggestion message="Adicione um seletor de tenants ativos na página /dev/personas para facilitar o teste de fluxos em diferentes grupos">Melhorar página de personas</lov-suggestion>
</lov-actions>Desculpe a chamada acidental. Resposta direta:

## Links de acesso

Olhando o roteamento em `src/App.tsx` e o que existe hoje no banco:

### 🚖 Motorista
O painel é unificado (motorista + afiliado) em `/painel`, atrás de login.

- **URL**: `https://motoristalivre.lovable.app/painel`
- Requer estar autenticado com um usuário cuja `role` seja `driver` (ou `affiliate`).
- Login: `/entrar` ou via Personas de dev em `/dev/personas`.

Já o **perfil público** de um motorista (página vista pelo passageiro) segue o padrão `/{tenant_slug}/perfil/{driver_slug}`. Exemplos reais no banco:

- `https://motoristalivre.lovable.app/papalegua/perfil/carlos-silva`
- `https://motoristalivre.lovable.app/papalegua/perfil/ana-souza`
- `https://motoristalivre.lovable.app/demo/perfil/motorista-demo`

### 🧍 Passageiro
Tela do passageiro (mapa + solicitação) é pública e usa o slug do tenant, podendo apontar para um motorista específico ou um link de afiliado:

| Cenário | Padrão de URL | Exemplo real |
|---|---|---|
| Tenant (lista de motoristas) | `/{tenant_slug}` | `https://motoristalivre.lovable.app/papalegua` |
| Motorista específico | `/{tenant_slug}/{driver_slug}` | `https://motoristalivre.lovable.app/papalegua/carlos-silva` |
| Via link de afiliado | `/{tenant_slug}/a/{affiliate_slug}` | `https://motoristalivre.lovable.app/papalegua/a/{slug-afiliado}` |

### Resumo rápido
- **Motorista (painel privado)** → `/painel`
- **Passageiro (público)** → `/{tenant_slug}` ou `/{tenant_slug}/{driver_slug}`

Tenants ativos hoje: `papalegua` e `demo` (os outros — `tribofinal`, `teste` — ainda não têm motoristas cadastrados).

<lov-actions>
<lov-suggestion message="Abra a página do passageiro em /papalegua/carlos-silva no preview e confirme que o mapa e o botão de solicitar corrida carregam corretamente">Testar página do passageiro</lov-suggestion>
<lov-suggestion message="Crie uma tela /links no painel do motorista que liste e permita copiar todas as URLs públicas relacionadas a ele (perfil, link direto de corrida, link de afiliado)">Adicionar tela de links no painel</lov-suggestion>
<lov-suggestion message="Gere QR Codes reais (usando a lib qrcode) para cada link público do motorista, substituindo o placeholder atual no card_link_afiliado.tsx">Gerar QR Codes reais</lov-suggestion>
<lov-suggestion message="Adicione um seletor de tenants ativos na página /dev/personas para facilitar o teste de fluxos em diferentes grupos">Melhorar página de personas</lov-suggestion>
</lov-actions>