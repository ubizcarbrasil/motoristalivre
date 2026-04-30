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
    id: "servicos_agendar_dedicado",
    titulo: "Agendar serviço — rota dedicada",
    descricao: "Página /demo/servicos/motorista-demo (fluxo direto de agendamento)",
    caminho: "/demo/servicos/motorista-demo",
    categoria: "servicos",
  },
  {
    id: "servicos_perfil_publico",
    titulo: "Perfil público do profissional (demo)",
    descricao: "Página pública com serviços, disponibilidade e agendamento",
    caminho: "/demo/perfil/motorista-demo",
    categoria: "servicos",
  },
  {
    id: "servicos_agendar_direto",
    titulo: "Agendar serviço direto (demo)",
    descricao: "Fluxo de escolha entre corrida e serviço no app do passageiro",
    caminho: "/demo/motorista-demo",
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
