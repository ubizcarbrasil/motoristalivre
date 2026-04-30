import { supabase } from "@/integrations/supabase/client";

export interface ProfissionalServicoListado {
  id: string;
  slug: string;
  nome: string;
  avatar_url: string | null;
  is_verified: boolean;
  credential_verified: boolean;
  professional_type: "service_provider" | "both";
  total_servicos: number;
}

export async function buscarTenantPorSlug(
  tenantSlug: string,
): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", tenantSlug)
    .maybeSingle();
  return data ?? null;
}

export async function listarProfissionaisServicoPorTenant(
  tenantSlug: string,
): Promise<ProfissionalServicoListado[]> {
  const tenant = await buscarTenantPorSlug(tenantSlug);
  if (!tenant) return [];

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, slug, is_verified, credential_verified, professional_type")
    .eq("tenant_id", tenant.id)
    .in("professional_type", ["service_provider", "both"]);

  if (!drivers || drivers.length === 0) return [];

  const ids = drivers.map((d) => d.id);
  const [{ data: users }, { data: servicos }] = await Promise.all([
    supabase.from("users").select("id, full_name, avatar_url").in("id", ids),
    supabase
      .from("service_types" as any)
      .select("driver_id")
      .in("driver_id", ids)
      .eq("is_active", true),
  ]);

  const mapaUsers = new Map((users ?? []).map((u) => [u.id, u]));
  const contagemServicos = new Map<string, number>();
  ((servicos ?? []) as any[]).forEach((s) => {
    contagemServicos.set(s.driver_id, (contagemServicos.get(s.driver_id) ?? 0) + 1);
  });

  return drivers
    .map((d) => ({
      id: d.id,
      slug: d.slug,
      nome: mapaUsers.get(d.id)?.full_name ?? "Profissional",
      avatar_url: mapaUsers.get(d.id)?.avatar_url ?? null,
      is_verified: d.is_verified,
      credential_verified: !!(d as any).credential_verified,
      professional_type: (d as any).professional_type,
      total_servicos: contagemServicos.get(d.id) ?? 0,
    }))
    .filter((p) => p.total_servicos > 0);
}
