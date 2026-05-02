export type TipoPergunta =
  | "single_select"
  | "multi_select"
  | "number_chips"
  | "date_chips"
  | "text_short"
  | "photo";

export interface OpcaoPergunta {
  valor: string;
  rotulo: string;
  icone?: string;
}

export interface PerguntaCondicional {
  campo: string;
  igual?: string;
  diferente?: string;
}

export interface PerguntaOrcamento {
  id: string;
  template_id: string;
  key: string;
  label: string;
  tipo: TipoPergunta;
  obrigatorio: boolean;
  ordem: number;
  opcoes?: OpcaoPergunta[] | null;
  condicional?: PerguntaCondicional | null;
  ajuda?: string | null;
}

export interface TemplateOrcamento {
  id: string;
  scope: "category" | "service_type";
  category_id: string | null;
  service_type_id: string | null;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  perguntas: PerguntaOrcamento[];
}

export type UrgenciaOrcamento = "agora" | "hoje" | "esta_semana" | "data_marcada";

export interface EnderecoOrcamento {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia?: string;
}

export interface ContatoOrcamento {
  nome: string;
  whatsapp: string;
}

export type RespostasOrcamento = Record<string, string | string[] | number | null>;

export interface CategoriaServico {
  id: string;
  slug: string;
  nome: string;
  icone: string | null;
  descricao: string | null;
}

export type StatusPedidoOrcamento = "open" | "closed" | "expired" | "cancelled";

export interface PedidoOrcamento {
  id: string;
  tenant_id: string;
  category_id: string;
  service_type_id: string | null;
  template_id: string | null;
  client_id: string | null;
  guest_passenger_id: string | null;
  contact_name: string | null;
  contact_whatsapp: string | null;
  respostas: RespostasOrcamento;
  perguntas_snapshot: PerguntaOrcamento[];
  endereco: EnderecoOrcamento | null;
  urgencia: UrgenciaOrcamento;
  data_desejada: string | null;
  max_propostas: number;
  fotos: string[];
  observacao: string | null;
  status: StatusPedidoOrcamento;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type StatusProposta = "pending" | "accepted" | "declined" | "withdrawn";

export interface PropostaOrcamento {
  id: string;
  request_id: string;
  driver_id: string;
  tenant_id: string;
  valor: number;
  prazo_dias_min: number | null;
  prazo_dias_max: number | null;
  data_disponivel: string | null;
  mensagem: string | null;
  status: StatusProposta;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}
