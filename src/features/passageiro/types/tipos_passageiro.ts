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

export type EtapaSolicitacao = "endereco" | "veiculo" | "buscando";
