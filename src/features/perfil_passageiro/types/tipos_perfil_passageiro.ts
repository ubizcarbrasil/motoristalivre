export interface AvaliacaoEnviada {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  ride_id: string;
  motorista_nome: string;
  motorista_avatar: string | null;
}

export interface DadosPerfilPassageiro {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  total_rides: number;
  total_spent: number;
  cashback_balance: number;
}
