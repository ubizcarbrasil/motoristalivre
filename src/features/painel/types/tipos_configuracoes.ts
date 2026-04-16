// Tipos da aba "Configurações" do painel
export type ModoDispatch = "auto" | "manual" | "hybrid";

export interface ConfigPrecoMotorista {
  base_fare: number;
  price_per_km: number;
  price_per_min: number;
  cashback_pct: number;
  permitido: boolean;
}

export interface ConfigRegrasDispatch {
  modo: ModoDispatch;
  timeout_sec: number;
  pode_editar: boolean;
}

export type DirecaoConvite = "invite_from_group" | "request_from_driver";
export type StatusConvite = "pending" | "accepted" | "rejected" | "expired";

export interface ConviteGrupo {
  id: string;
  tenant_id: string;
  tenant_nome: string;
  tenant_slug: string;
  direction: DirecaoConvite;
  status: StatusConvite;
  message: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface GrupoMotorista {
  tenant_id: string;
  tenant_nome: string;
  tenant_slug: string;
  papel: "tenant_admin" | "manager" | "driver" | "affiliate";
  corridas_mes: number;
}

export interface ResultadoBuscaGrupo {
  id: string;
  name: string;
  slug: string;
  ja_e_membro: boolean;
  tem_solicitacao_pendente: boolean;
}
