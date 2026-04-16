import { supabase } from "@/integrations/supabase/client";
import type { DadosIdentidade, DadosConfiguracao } from "../types/tipos_onboarding";

interface CriarGrupoParams {
  identidade: DadosIdentidade;
  planoId: string;
  configuracao: DadosConfiguracao;
}

export async function criarGrupo({ identidade, planoId, configuracao }: CriarGrupoParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Buscar plano pelo nome
  const { data: plano } = await supabase
    .from("plans")
    .select("id")
    .eq("name", planoId)
    .maybeSingle();

  // Criar tenant
  const { data: tenant, error: erroTenant } = await supabase
    .from("tenants")
    .insert({
      name: identidade.nome,
      slug: identidade.subdominio,
      owner_user_id: user.id,
      plan_id: plano?.id ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (erroTenant || !tenant) throw erroTenant || new Error("Erro ao criar grupo");

  // Criar registro do usuário como tenant_admin
  const { error: erroUsuario } = await supabase
    .from("users")
    .insert({
      id: user.id,
      tenant_id: tenant.id,
      role: "tenant_admin",
      full_name: user.user_metadata?.full_name ?? null,
      email: user.email ?? null,
      phone: user.user_metadata?.phone ?? null,
    });

  if (erroUsuario) throw erroUsuario;

  // Criar branding
  await supabase.from("tenant_branding").insert({
    tenant_id: tenant.id,
    city: identidade.cidade || null,
    description: identidade.descricao || null,
    whatsapp: identidade.whatsapp || null,
  });

  // Criar settings
  await supabase.from("tenant_settings").insert({
    tenant_id: tenant.id,
    dispatch_mode: configuracao.modoDespacho,
    base_fare: configuracao.bandeira,
    price_per_km: configuracao.precoPorKm,
    price_per_min: configuracao.precoPorMin,
    transbordo_commission: configuracao.comissaoTransbordo,
    cashback_pct: configuracao.cashbackPadrao,
  });

  // Criar subscription
  if (plano?.id) {
    await supabase.from("subscriptions").insert({
      tenant_id: tenant.id,
      plan_id: plano.id,
      status: "active",
    });
  }

  return tenant.id;
}
