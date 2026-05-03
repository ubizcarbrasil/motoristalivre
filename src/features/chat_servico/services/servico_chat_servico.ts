import { supabase } from "@/integrations/supabase/client";
import type { MensagemChatServico, PapelChatServico } from "../types/tipos_chat_servico";

// ===== Cliente logado / Profissional =====

export async function listarMensagens(bookingId: string): Promise<MensagemChatServico[]> {
  const { data, error } = await supabase
    .from("service_booking_messages")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MensagemChatServico[];
}

export async function enviarMensagem(params: {
  bookingId: string;
  tenantId: string;
  papel: PapelChatServico;
  senderId: string;
  content: string;
}): Promise<MensagemChatServico> {
  const { data, error } = await supabase
    .from("service_booking_messages")
    .insert({
      booking_id: params.bookingId,
      tenant_id: params.tenantId,
      sender_role: params.papel,
      sender_id: params.senderId,
      content: params.content.trim(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as MensagemChatServico;
}

export async function marcarMensagensLidas(params: {
  bookingId: string;
  meuPapel: PapelChatServico;
}): Promise<void> {
  // marca como lidas as mensagens enviadas pelo OUTRO lado
  const outroPapel: PapelChatServico = params.meuPapel === "client" ? "driver" : "client";
  const { error } = await supabase
    .from("service_booking_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("booking_id", params.bookingId)
    .eq("sender_role", outroPapel)
    .is("read_at", null);
  if (error) throw error;
}

// ===== Convidado (guest) =====

export async function listarMensagensGuest(
  bookingId: string,
  guestId: string
): Promise<MensagemChatServico[]> {
  const { data, error } = await supabase.rpc("listar_mensagens_chat_guest", {
    _booking_id: bookingId,
    _guest_id: guestId,
  });
  if (error) throw error;
  return (data ?? []) as MensagemChatServico[];
}

export async function enviarMensagemGuest(params: {
  bookingId: string;
  guestId: string;
  content: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("enviar_mensagem_chat_guest", {
    _booking_id: params.bookingId,
    _guest_id: params.guestId,
    _content: params.content.trim(),
  });
  if (error) throw error;
  return data as string;
}

export async function marcarLidasGuest(bookingId: string, guestId: string): Promise<void> {
  const { error } = await supabase.rpc("marcar_lidas_chat_guest", {
    _booking_id: bookingId,
    _guest_id: guestId,
  });
  if (error) throw error;
}
