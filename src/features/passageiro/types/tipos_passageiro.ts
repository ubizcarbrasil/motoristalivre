export interface Coordenada {
  lat: number;
  lng: number;
}

export interface EnderecoCompleto {
  coordenada: Coordenada;
  endereco: string;
}

export interface OpcaoVeiculo {
  id: string;
  nome: string;
  descricao: string;
  multiplicador: number;
  icone: string;
}

export interface PrecoCalculado {
  veiculo: OpcaoVeiculo;
  preco: number;
}

export interface DadosMotorista {
  id: string;
  nome: string;
  avatar_url: string | null;
  slug: string;
  nota: number | null;
  is_online: boolean;
  grupo_nome: string;
  tenant_id: string;
}

export interface MotoristaListado {
  id: string;
  slug: string;
  nome: string;
  avatar_url: string | null;
  is_online: boolean;
  is_verified: boolean;
  tenant_slug: string;
}

export interface DadosAfiliado {
  id: string;
  nome: string;
  slug: string;
  business_name: string | null;
  grupo_nome: string;
  tenant_id: string;
}

export interface ConfigPreco {
  bandeira: number;
  preco_por_km: number;
  preco_por_min: number;
  tarifa_minima: number;
}

export interface DadosRota {
  distancia_km: number;
  duracao_min: number;
  pontos: Coordenada[];
}

export type TipoOrigem = "motorista" | "afiliado";

export type EtapaSolicitacao = "endereco" | "veiculo" | "buscando" | "aceita";

export type FormaPagamento = "dinheiro" | "pix" | "cartao" | "saldo";

export type StatusCorrida = "accepted" | "in_progress" | "completed" | "cancelled" | "expired";

export interface MotoristaCorrida {
  id: string;
  nome: string;
  handle: string;
  avatar_url: string | null;
  telefone: string | null;
  nota_media: number;
  total_corridas: number;
  is_online: boolean;
  grupos: { handle: string; nome: string }[];
  veiculo: {
    modelo: string | null;
    ano: number | null;
    cor: string | null;
    placa: string | null;
  };
}

export interface AvaliacaoMotorista {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CorridaAceita {
  ride_request_id: string;
  ride_id: string | null;
  status: StatusCorrida;
  motorista: MotoristaCorrida;
  estimated_min: number;
  accepted_at: string;
  avaliacoes: AvaliacaoMotorista[];
}
