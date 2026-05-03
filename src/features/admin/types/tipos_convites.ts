export type StatusConviteAdmin = "pending" | "accepted" | "rejected" | "expired";

export interface ProfissionalBusca {
  driver_id: string;
  nome: string;
  handle: string | null;
  avatar_url: string | null;
  tenant_id_atual: string | null;
  ja_e_membro: boolean;
  ja_tem_convite_pendente: boolean;
  ja_tem_solicitacao_pendente: boolean;
}

export interface ConviteEnviado {
  id: string;
  driver_id: string;
  driver_nome: string;
  driver_handle: string | null;
  driver_avatar_url: string | null;
  status: StatusConviteAdmin;
  message: string | null;
  expires_at: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface SolicitacaoRecebida {
  id: string;
  driver_id: string;
  driver_nome: string;
  driver_handle: string | null;
  driver_avatar_url: string | null;
  message: string | null;
  created_at: string;
}
