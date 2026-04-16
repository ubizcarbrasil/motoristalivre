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
