export type AbaPainel = "inicio" | "perfil" | "tribo" | "carteira" | "precos";

export interface EstatisticasHoje {
  faturamento: number;
  corridas: number;
  comissoes: number;
  avaliacao: number;
}

export interface CorridaRecente {
  id: string;
  origem_endereco: string;
  destino_endereco: string;
  valor: number;
  origem_tipo: string | null;
  origem_nome: string | null;
  created_at: string;
}

export interface DispatchAtivo {
  id: string;
  ride_request_id: string;
  origem_endereco: string;
  destino_endereco: string;
  distancia_km: number;
  duracao_min: number;
  valor: number;
  origem_tipo: string | null;
  origem_nome: string | null;
  dispatched_at: string;
}

export interface PerfilMotorista {
  id: string;
  nome: string;
  avatar_url: string | null;
  bio: string | null;
  cover_url: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  is_online: boolean;
  is_verified: boolean;
  slug: string;
  cashback_pct: number;
  custom_base_fare: number | null;
  custom_price_per_km: number | null;
  custom_price_per_min: number | null;
}

export interface ReputacaoMotorista {
  notaMedia: number;
  totalAvaliacoes: number;
  distribuicao: number[]; // [1 estrela, 2, 3, 4, 5]
  taxaAceite: number;
  mesesAtuacao: number;
}

export interface AvaliacaoRecente {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface MotoristaRanking {
  id: string;
  nome: string;
  avatar_url: string | null;
  corridas: number;
  faturamento: number;
}

export interface TransacaoCarteira {
  id: string;
  tipo: string;
  valor: number;
  descricao: string | null;
  created_at: string;
  saldo_apos: number;
}

export interface SaldoCarteira {
  saldo: number;
  bloqueado: number;
  totalGanho: number;
  totalSacado: number;
}
