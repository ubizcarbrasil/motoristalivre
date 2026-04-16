export interface PerfilPublicoMotorista {
  id: string;
  nome: string;
  avatar_url: string | null;
  bio: string | null;
  cover_url: string | null;
  slug: string;
  is_online: boolean;
  is_verified: boolean;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  cashback_pct: number | null;
  tenant_slug: string;
  tenant_nome: string;
}

export interface MetricasMotorista {
  nota_media: number;
  total_avaliacoes: number;
  taxa_aceite: number;
  meses_atuacao: number;
}

export interface DistribuicaoNotas {
  estrela: number;
  quantidade: number;
  percentual: number;
}

export interface AvaliacaoPublica {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
