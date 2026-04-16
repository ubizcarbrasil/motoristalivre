import { supabase } from "@/integrations/supabase/client";
import type { DadosIdentidade, DadosConfiguracao } from "../types/tipos_onboarding";

interface CriarGrupoParams {
  identidade: DadosIdentidade;
  planoId: string;
  configuracao: DadosConfiguracao;
}

export async function criarGrupo({ identidade, planoId, configuracao }: CriarGrupoParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario nao autenticado");

  // Criar tenant + user atomicamente via RPC
  const { data: tenantId, error: erroTenant } = await supabase.rpc(
    "create_tenant_with_owner" as any,
    {
      _name: identidade.nome,
      _slug: identidade.subdominio,
      _plan_id: planoId || null,
    }
  );

  if (erroTenant || !tenantId) throw erroTenant || new Error("Erro ao criar grupo");

  // Criar branding
  await supabase.from("tenant_branding").insert({
    tenant_id: tenantId,
    city: identidade.cidade || null,
    description: identidade.descricao || null,
    whatsapp: identidade.whatsapp || null,
    logo_url: identidade.logoUrl || null,
    cover_url: identidade.capaUrl || null,
  });

  // Criar settings
  await supabase.from("tenant_settings").insert({
    tenant_id: tenantId,
    dispatch_mode: configuracao.modoDespacho,
    base_fare: configuracao.bandeira,
    price_per_km: configuracao.precoPorKm,
    price_per_min: configuracao.precoPorMin,
    transbordo_commission: configuracao.comissaoTransbordo,
    cashback_pct: configuracao.cashbackPadrao,
  });

  // Criar subscription
  if (planoId) {
    await supabase.from("subscriptions").insert({
      tenant_id: tenantId,
      plan_id: planoId,
      status: "active",
    });
  }

  return tenantId;
}
