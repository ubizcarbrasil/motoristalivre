import { supabase } from "@/integrations/supabase/client";

export type StatusEspelhamento = "pending" | "accepted" | "declined" | "cancelled";

export interface ConviteEspelhamento {
  id: string;
  tenant_id: string;
  inviter_driver_id: string;
  invitee_driver_id: string;
  status: StatusEspelhamento;
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

export async function enviarConviteEspelhamento(params: {
  tenant_id: string;
  inviter_driver_id: string;
  invitee_driver_id: string;
  message?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("team_mirror_invites" as any).insert({
    tenant_id: params.tenant_id,
    inviter_driver_id: params.inviter_driver_id,
    invitee_driver_id: params.invitee_driver_id,
    status: "pending",
    message: params.message ?? null,
  });
  if (error) throw error;
}

export async function listarConvitesRecebidos(driverId: string): Promise<ConviteEspelhamento[]> {
  const { data, error } = await supabase
    .from("team_mirror_invites" as any)
    .select("*")
    .eq("invitee_driver_id", driverId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as any) as ConviteEspelhamento[];
}

export async function responderConviteEspelhamento(
  conviteId: string,
  aceitar: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("team_mirror_invites" as any)
    .update({ status: aceitar ? "accepted" : "declined" })
    .eq("id", conviteId);
  if (error) throw error;
}
