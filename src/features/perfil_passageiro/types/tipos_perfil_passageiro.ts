export interface EnderecoCorrida {
  coordenada: { lat: number; lng: number };
  endereco: string;
}

export interface AvaliacaoEnviada {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  ride_id: string;
  motorista_nome: string;
  motorista_avatar: string | null;
}

export type StatusCorrida =
  | "pending"
  | "dispatching"
  | "accepted"
  | "in_progress"
  | "completed"
  | "expired"
  | "cancelled";

export interface CorridaHistorico {
  id: string;
  ride_request_id: string | null;
  created_at: string;
  completed_at: string | null;
  status: StatusCorrida;
  price_paid: number | null;
  distance_km: number | null;
  origin_address: string | null;
  dest_address: string | null;
  motorista_id: string | null;
  motorista_nome: string;
  motorista_avatar: string | null;
}

export interface DetalhesCorrida {
  id: string;
  ride_request_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: StatusCorrida;
  price_paid: number | null;
  payment_method: string | null;
  distance_km: number | null;
  estimated_min: number | null;
  duration_min: number | null;
  origin_address: string | null;
  dest_address: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  dest_lat: number | null;
  dest_lng: number | null;
  motorista: {
    id: string | null;
    nome: string;
    avatar: string | null;
    telefone: string | null;
    veiculo_modelo: string | null;
    veiculo_placa: string | null;
    veiculo_cor: string | null;
  };
}

export const STATUS_CORRIDA_LABELS: Record<StatusCorrida, { label: string; cor: string }> = {
  pending: { label: "Pendente", cor: "text-yellow-500 bg-yellow-500/10" },
  dispatching: { label: "Buscando", cor: "text-blue-500 bg-blue-500/10" },
  accepted: { label: "Aceita", cor: "text-blue-500 bg-blue-500/10" },
  in_progress: { label: "Em andamento", cor: "text-blue-500 bg-blue-500/10" },
  completed: { label: "Concluída", cor: "text-primary bg-primary/10" },
  expired: { label: "Expirada", cor: "text-muted-foreground bg-muted" },
  cancelled: { label: "Cancelada", cor: "text-destructive bg-destructive/10" },
};

export interface DadosPerfilPassageiro {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  tenant_id: string;
  total_rides: number;
  total_spent: number;
  cashback_balance: number;
}
