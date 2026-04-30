import type {
  PlanoOpcao,
  DadosIdentidade,
  DadosConfiguracao,
  DadosServico,
  ModoCobranca,
} from "../types/tipos_onboarding";

export const ETAPAS = [
  "Identidade",
  "Módulos",
  "Plano",
  "Pagamento",
  "Configuração",
  "Convites",
] as const;

export const MODULOS_DISPONIVEIS = [
  {
    id: "mobility" as const,
    titulo: "Mobilidade",
    descricao: "Corridas e transporte — motoristas com link próprio e despacho automático",
    icone: "car",
  },
  {
    id: "services" as const,
    titulo: "Serviços",
    descricao: "Agendamentos e chamadas — profissionais liberais com agenda digital",
    icone: "calendar",
  },
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
  corPrimaria: "#1db865",
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

export const MODOS_COBRANCA: { valor: ModoCobranca; titulo: string; rotuloPreco: string; rotuloDuracao: string; unidadeDuracao: string }[] = [
  { valor: "fixed", titulo: "Valor fixo", rotuloPreco: "Valor (R$)", rotuloDuracao: "Duração estimada (min)", unidadeDuracao: "min" },
  { valor: "hourly", titulo: "Por hora", rotuloPreco: "Valor por hora (R$)", rotuloDuracao: "Duração estimada (h)", unidadeDuracao: "h" },
  { valor: "daily", titulo: "Por diária", rotuloPreco: "Valor da diária (R$)", rotuloDuracao: "Duração (dias)", unidadeDuracao: "dias" },
];

export const SERVICO_INICIAL: Omit<DadosServico, "id"> = {
  nome: "",
  descricao: "",
  modoCobranca: "fixed",
  preco: 0,
  duracao: 60,
  depositoAtivo: false,
  depositoTipo: "percent",
  depositoPct: 30,
  depositoValor: 0,
};
