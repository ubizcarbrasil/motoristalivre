import { supabase } from "@/integrations/supabase/client";
import type { DadosSolicitacaoSaque, DonoCarteira } from "../types/tipos_saque";

export async function garantirCarteira(ownerType: DonoCarteira): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_wallet", { _owner_type: ownerType });
  if (error) throw error;
  return data as string;
}

export async function solicitarSaque(dados: DadosSolicitacaoSaque): Promise<string> {
  const { data, error } = await supabase.rpc("request_payout", {
    _owner_type: dados.ownerType,
    _amount: dados.amount,
    _pix_key: dados.pixKey,
    _pix_key_type: dados.pixKeyType,
  });
  if (error) throw error;
  return data as string;
}

export async function aprovarSaque(payoutId: string): Promise<void> {
  const { error } = await supabase.rpc("approve_payout", { _payout_id: payoutId });
  if (error) throw error;
}

export async function rejeitarSaque(payoutId: string): Promise<void> {
  const { error } = await supabase.rpc("reject_payout", { _payout_id: payoutId });
  if (error) throw error;
}

export async function buscarHistoricoSaques(
  ownerType: DonoCarteira,
  userId: string
): Promise<import("../types/tipos_saque").HistoricoSaque[]> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("owner_id", userId)
    .eq("owner_type", ownerType)
    .maybeSingle();

  if (!wallet) return [];

  const { data, error } = await supabase
    .from("payouts")
    .select("id, amount, pix_key, pix_key_type, status, requested_at, processed_at, processed_by")
    .eq("wallet_id", wallet.id)
    .order("requested_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const processorIds = Array.from(
    new Set(data.map((d) => d.processed_by).filter((id): id is string => !!id))
  );

  const mapaNomes = new Map<string, string>();
  if (processorIds.length > 0) {
    const { data: usuarios } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", processorIds);
    (usuarios ?? []).forEach((u) => {
      mapaNomes.set(u.id, u.full_name || u.email || "Administrador");
    });
  }

  return data.map((d) => ({
    ...d,
    processed_by_name: d.processed_by ? mapaNomes.get(d.processed_by) ?? "Administrador" : null,
  })) as import("../types/tipos_saque").HistoricoSaque[];
}
