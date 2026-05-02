export interface MembroRecrutado {
  referral_id: string;
  recruited_id: string;
  nome: string;
  avatar_url: string | null;
  signup_amount: number;
  total_monthly_earned: number;
  monthly_active: boolean;
  created_at: string;
}

export interface RepasseMensal {
  id: string;
  ano_mes: string;
  amount: number;
  recruited_id: string;
  recruited_nome: string;
  created_at: string;
}

export interface KpisMinhaRede {
  total_recrutados: number;
  recrutados_ativos: number;
  mrr_gerado: number;
  total_acumulado: number;
  proxima_recorrencia: string | null;
}
