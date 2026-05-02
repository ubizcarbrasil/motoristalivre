import { supabase } from "@/integrations/supabase/client";
import type {
  CategoriaServico,
  PayloadRegraComissao,
  RegraComissaoComCategoria,
} from "../types/tipos_regras_comissao";

export async function listarCategoriasAtivas(): Promise<CategoriaServico[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, slug, nome, icone, ativo")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoriaServico[];
}

export async function listarRegrasTenant(
  tenantId: string,
): Promise<RegraComissaoComCategoria[]> {
  const { data, error } = await supabase
    .from("commission_rules")
    .select(
      "id, tenant_id, category_id, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl, ativo, categoria:service_categories(id, slug, nome, icone, ativo)",
    )
    .eq("tenant_id", tenantId);
  if (error) throw error;
  return (data ?? []) as unknown as RegraComissaoComCategoria[];
}

export async function criarRegraComissao(
  tenantId: string,
  payload: PayloadRegraComissao,
): Promise<void> {
  const { error } = await supabase
    .from("commission_rules")
    .insert({ tenant_id: tenantId, ...payload });
  if (error) throw error;
}

export async function atualizarRegraComissao(
  id: string,
  payload: PayloadRegraComissao,
): Promise<void> {
  const { error } = await supabase
    .from("commission_rules")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function removerRegraComissao(id: string): Promise<void> {
  const { error } = await supabase.from("commission_rules").delete().eq("id", id);
  if (error) throw error;
}
