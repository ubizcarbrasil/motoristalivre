import { supabase } from "@/integrations/supabase/client";

/**
 * Cria uma tribo enxuta para profissional autônomo (barbeiro, manicure, etc.).
 * Não passa pelo onboarding completo de grupo — gera slug a partir do nome,
 * cria tenant + branding + settings padrão e marca o driver como service_provider.
 *
 * Idempotente: se o usuário já tem tenant, só garante o driver/professional_type.
 */
export async function criarTriboProfissional(nomeUsuario: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Já tem tenant? Apenas garante driver service_provider e retorna.
  const { data: usuarioExistente } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  if (usuarioExistente?.tenant_id) {
    await garantirDriverServiceProvider(usuarioExistente.tenant_id);
    return usuarioExistente.tenant_id;
  }

  const nomeBase = (nomeUsuario || user.email?.split("@")[0] || "profissional").trim();
  const slug = await gerarSlugUnico(nomeBase);

  const { data: tenantId, error: erroTenant } = await supabase.rpc(
    "create_tenant_with_owner" as any,
    { _name: nomeBase, _slug: slug, _plan_id: null }
  );
  if (erroTenant || !tenantId) {
    throw erroTenant || new Error("Erro ao criar espaço do profissional");
  }

  await supabase
    .from("tenants")
    .update({ active_modules: ["services"] } as any)
    .eq("id", tenantId);

  await supabase.from("tenant_branding").insert({ tenant_id: tenantId });
  await supabase.from("tenant_settings").insert({ tenant_id: tenantId });

  await garantirDriverServiceProvider(tenantId as string);

  return tenantId as string;
}

async function garantirDriverServiceProvider(tenantId: string): Promise<void> {
  const { data: driverId, error } = await supabase.rpc(
    "ensure_driver_profile" as any,
    { _tenant_id: tenantId }
  );
  if (error || !driverId) return;

  await supabase
    .from("drivers")
    .update({ professional_type: "service_provider" } as any)
    .eq("id", driverId as string);
}

async function gerarSlugUnico(nome: string): Promise<string> {
  const base = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "profissional";

  let candidato = base;
  let tentativa = 0;
  while (tentativa < 20) {
    const { data } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", candidato)
      .maybeSingle();
    if (!data) return candidato;
    tentativa += 1;
    candidato = `${base}-${tentativa + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
