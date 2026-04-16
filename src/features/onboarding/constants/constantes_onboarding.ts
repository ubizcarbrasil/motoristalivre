import type { PlanoOpcao, DadosIdentidade, DadosConfiguracao } from "../types/tipos_onboarding";

export const ETAPAS = [
  "Identidade",
  "Plano",
  "Pagamento",
  "Configuração",
  "Convites",
] as const;

export const PLANOS: PlanoOpcao[] = [
  {
    id: "start",
    nome: "Start",
    precoMensal: 49.9,
    precoAdesao: 0,
    maxMotoristas: 5,
    features: [
      "Até 5 motoristas",
      "Link personalizado",
      "Despacho automático",
      "Painel básico",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    precoMensal: 99.9,
    precoAdesao: 0,
    maxMotoristas: 30,
    destaque: true,
    features: [
      "Até 30 motoristas",
      "Subdomínio próprio",
      "Cashback configurável",
      "Comissão por transbordo",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
  },
  {
    id: "scale",
    nome: "Scale",
    precoMensal: 249.9,
    precoAdesao: 0,
    maxMotoristas: 200,
    features: [
      "Até 200 motoristas",
      "API completa",
      "Afiliados ilimitados",
      "Multi-gerente",
      "White-label",
      "Suporte dedicado",
    ],
  },
];

export const IDENTIDADE_INICIAL: DadosIdentidade = {
  nome: "",
  cidade: "",
  descricao: "",
  subdominio: "",
  whatsapp: "",
  logoUrl: "",
  capaUrl: "",
};

export const CONFIGURACAO_INICIAL: DadosConfiguracao = {
  modoDespacho: "auto",
  bandeira: 5,
  precoPorKm: 2,
  precoPorMin: 0.5,
  comissaoTransbordo: 10,
  cashbackPadrao: 0,
};

export const MODOS_DESPACHO = [
  {
    valor: "auto" as const,
    titulo: "Prioridade ao dono do link",
    descricao: "Corridas vão primeiro para quem gerou o link do passageiro",
  },
  {
    valor: "manual" as const,
    titulo: "Por proximidade",
    descricao: "Motorista mais próximo recebe a corrida primeiro",
  },
  {
    valor: "hybrid" as const,
    titulo: "Para todos",
    descricao: "Todos os motoristas online recebem a solicitação",
  },
];

export const CHAVE_PIX_SIMULADA = "tribocar@pagamentos.com.br";
