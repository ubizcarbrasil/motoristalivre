export type PapelChatServico = "client" | "driver";

export interface MensagemChatServico {
  id: string;
  booking_id: string;
  tenant_id: string;
  sender_role: PapelChatServico;
  sender_id: string | null;
  guest_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface IdentidadeChatServico {
  papel: PapelChatServico;
  user_id?: string | null;
  guest_id?: string | null;
}
