export const URL_BASE_PUBLICA = "https://motoristalivre.lovable.app";

export interface LinkAcesso {
  id: string;
  titulo: string;
  descricao: string;
  caminho: string;
  categoria: "passageiro" | "motorista" | "servicos" | "dev";
}

export const LINKS_ACESSO: LinkAcesso[] = [
  {
    id: "passageiro_demo",
    titulo: "App do passageiro (grupo demo)",
    descricao: "Lista de motoristas do grupo demo",
    caminho: "/demo",
    categoria: "passageiro",
  },
  {
    id: "passageiro_motorista_demo",
    titulo: "Passageiro direto no motorista demo",
    descricao: "Solicitar corrida direto pra motorista-demo",
    caminho: "/demo/motorista-demo",
    categoria: "passageiro",
  },
  {
    id: "motorista_login",
    titulo: "Login do motorista",
    descricao: "Entrar com conta de motorista",
    caminho: "/entrar",
    categoria: "motorista",
  },
  {
    id: "motorista_painel",
    titulo: "Painel do motorista",
    descricao: "Acesso direto ao painel (precisa estar logado)",
    caminho: "/painel",
    categoria: "motorista",
  },
  {
    id: "servicos_lista_tenant",
    titulo: "Lista de profissionais (demo)",
    descricao: "Página /demo/servicos com todos os profissionais que oferecem serviços",
    caminho: "/demo/servicos",
    categoria: "servicos",
  },
  {
    id: "servicos_prestador_demo",
    titulo: "Prestador demo — agendamento direto",
    descricao: "Página /demo/prestador-demo (renderiza AgendamentoServico via bifurcação automática)",
    caminho: "/demo/prestador-demo",
    categoria: "servicos",
  },
  {
    id: "servicos_agendar_dedicado",
    titulo: "Prestador demo — rota dedicada de serviços",
    descricao: "Página /demo/servicos/prestador-demo (fluxo direto de agendamento)",
    caminho: "/demo/servicos/prestador-demo",
    categoria: "servicos",
  },
  {
    id: "servicos_perfil_publico",
    titulo: "Perfil público do prestador (demo)",
    descricao: "Página pública com serviços, disponibilidade e agendamento",
    caminho: "/demo/perfil/prestador-demo",
    categoria: "servicos",
  },
  {
    id: "servicos_painel_motorista",
    titulo: "Painel do profissional — aba Configurações",
    descricao: "Gerenciar serviços, disponibilidade e tipo de profissional",
    caminho: "/painel?aba=configuracoes",
    categoria: "servicos",
  },
  {
    id: "dev_personas",
    titulo: "Contas de teste prontas",
    descricao: "Login direto nas personas demo (motorista, passageiro, admin)",
    caminho: "/dev/personas",
    categoria: "dev",
  },
];

export const CREDENCIAIS_DEMO = [
  { papel: "Motorista", email: "motorista@tribocar.test", senha: "Tribo@2025" },
  { papel: "Passageiro", email: "passageiro@tribocar.test", senha: "Tribo@2025" },
];
