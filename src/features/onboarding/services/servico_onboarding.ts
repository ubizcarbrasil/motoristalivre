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

  // Criar tenant sem owner (para evitar FK violation, pois user ainda nao existe)
  const { data: tenant, error: erroTenant } = await supabase
    .from("tenants")
    .insert({
      name: identidade.nome,
      slug: identidade.subdominio,
      plan_id: planoId || null,
      status: "active",
    })
    .select("id")
    .single();

  if (erroTenant || !tenant) throw erroTenant || new Error("Erro ao criar grupo");

  // Upsert user como tenant_admin (trigger pode ter criado o registro antes)
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingUser) {
    await supabase
      .from("users")
      .update({
        tenant_id: tenant.id,
        role: "tenant_admin" as const,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        email: user.email ?? null,
      })
      .eq("id", user.id);
  } else {
    await supabase.from("users").insert({
      id: user.id,
      tenant_id: tenant.id,
      role: "tenant_admin" as const,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      email: user.email ?? null,
    });
  }

  // Atualizar tenant com owner
  await supabase
    .from("tenants")
    .update({ owner_user_id: user.id })
    .eq("id", tenant.id);

  // Criar branding
  await supabase.from("tenant_branding").insert({
    tenant_id: tenant.id,
    city: identidade.cidade || null,
    description: identidade.descricao || null,
    whatsapp: identidade.whatsapp || null,
    logo_url: identidade.logoUrl || null,
    cover_url: identidade.capaUrl || null,
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
  if (planoId) {
    await supabase.from("subscriptions").insert({
      tenant_id: tenant.id,
      plan_id: planoId,
      status: "active",
    });
  }

  return tenant.id;
}
