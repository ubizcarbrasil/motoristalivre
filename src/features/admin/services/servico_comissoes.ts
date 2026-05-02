import { supabase } from "@/integrations/supabase/client";
import type { ComissoesTenant } from "../types/tipos_comissoes";

const VALORES_PADRAO: ComissoesTenant = {
  transbordo_commission: 10,
  affiliate_commission: 5,
  cashback_pct: 0,
};

export async function buscarComissoesTenant(tenantId: string): Promise<ComissoesTenant> {
  const { data, error } = await supabase
    .from("tenant_settings")
    .select("transbordo_commission, affiliate_commission, cashback_pct")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return VALORES_PADRAO;

  return {
    transbordo_commission: Number(data.transbordo_commission ?? VALORES_PADRAO.transbordo_commission),
    affiliate_commission: Number(data.affiliate_commission ?? VALORES_PADRAO.affiliate_commission),
    cashback_pct: Number(data.cashback_pct ?? VALORES_PADRAO.cashback_pct),
  };
}

export async function salvarComissoesTenant(
  tenantId: string,
  valores: ComissoesTenant,
): Promise<void> {
  // Tenta UPDATE primeiro; se não houver linha, faz INSERT
  const { data: existente, error: erroBusca } = await supabase
    .from("tenant_settings")
    .select("tenant_id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (erroBusca) throw erroBusca;

  if (existente) {
    const { error } = await supabase
      .from("tenant_settings")
      .update(valores)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("tenant_settings")
    .insert({ tenant_id: tenantId, ...valores });
  if (error) throw error;
}
