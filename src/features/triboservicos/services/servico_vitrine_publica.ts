import { supabase } from "@/integrations/supabase/client";

export interface TenantPublicoServicos {
  id: string;
  slug: string;
  name: string;
  branding: {
    logo_url: string | null;
    cover_url: string | null;
    description: string | null;
    city: string | null;
    whatsapp: string | null;
  } | null;
}

export interface ProfissionalVitrine {
  id: string;
  slug: string;
  nome: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  is_verified: boolean;
  credential_verified: boolean;
  service_categories: string[];
  total_servicos: number;
  preco_minimo: number | null;
}

export interface ItemPortfolio {
  id: string;
  image_url: string;
  caption: string | null;
  service_type_id: string;
  ordem: number;
}

export async function buscarTenantPublicoServicos(
  tenantSlug: string,
): Promise<TenantPublicoServicos | null> {
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, slug, name, active_modules")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) return null;

  const { data: branding } = await supabase
    .from("tenant_branding")
    .select("logo_url, cover_url, description, city, whatsapp")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    branding: branding ?? null,
  };
}

export async function listarProfissionaisVitrine(
  tenantId: string,
): Promise<ProfissionalVitrine[]> {
  const { data: drivers } = await supabase
    .from("drivers")
    .select(
      "id, slug, bio, avatar_url, cover_url, is_verified, credential_verified, professional_type, service_categories",
    )
    .eq("tenant_id", tenantId)
    .in("professional_type", ["service_provider", "both"]);

  if (!drivers || drivers.length === 0) return [];

  const ids = drivers.map((d) => d.id);

  const [{ data: users }, { data: servicos }] = await Promise.all([
    supabase.from("users").select("id, full_name, avatar_url").in("id", ids),
    supabase
      .from("service_types" as any)
      .select("driver_id, price")
      .in("driver_id", ids)
      .eq("is_active", true),
  ]);

  const mapaUsers = new Map((users ?? []).map((u) => [u.id, u]));
  const contagem = new Map<string, number>();
  const minimo = new Map<string, number>();

  ((servicos ?? []) as any[]).forEach((s) => {
    contagem.set(s.driver_id, (contagem.get(s.driver_id) ?? 0) + 1);
    const atual = minimo.get(s.driver_id);
    const preco = Number(s.price);
    if (atual === undefined || preco < atual) {
      minimo.set(s.driver_id, preco);
    }
  });

  return drivers
    .map((d) => ({
      id: d.id,
      slug: d.slug,
      nome: mapaUsers.get(d.id)?.full_name ?? "Profissional",
      avatar_url: (d as any).avatar_url ?? mapaUsers.get(d.id)?.avatar_url ?? null,
      cover_url: (d as any).cover_url ?? null,
      bio: (d as any).bio ?? null,
      is_verified: !!d.is_verified,
      credential_verified: !!(d as any).credential_verified,
      service_categories: ((d as any).service_categories as string[]) ?? [],
      total_servicos: contagem.get(d.id) ?? 0,
      preco_minimo: minimo.get(d.id) ?? null,
    }))
    .filter((p) => p.total_servicos > 0)
    .sort((a, b) => Number(b.is_verified) - Number(a.is_verified));
}

export interface ItemPreviewPortfolioTenant {
  id: string;
  image_url: string;
  caption: string | null;
  driver_id: string;
  driver_slug: string;
  driver_nome: string;
}

export async function listarPreviewPortfolioTenant(
  tenantId: string,
  limite = 6,
): Promise<ItemPreviewPortfolioTenant[]> {
  const { data: itens } = await supabase
    .from("service_portfolio_items" as any)
    .select("id, image_url, caption, driver_id, ordem, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limite * 3);

  const lista = ((itens ?? []) as any[]) as Array<{
    id: string;
    image_url: string;
    caption: string | null;
    driver_id: string;
  }>;

  if (lista.length === 0) return [];

  const driverIds = Array.from(new Set(lista.map((i) => i.driver_id)));
  const [{ data: drivers }, { data: users }] = await Promise.all([
    supabase.from("drivers").select("id, slug").in("id", driverIds),
    supabase.from("users").select("id, full_name").in("id", driverIds),
  ]);

  const mapaDriver = new Map((drivers ?? []).map((d) => [d.id, d.slug]));
  const mapaNome = new Map((users ?? []).map((u) => [u.id, u.full_name]));

  // Diversifica: no máximo 2 itens por profissional
  const contagem = new Map<string, number>();
  const resultado: ItemPreviewPortfolioTenant[] = [];
  for (const it of lista) {
    const usados = contagem.get(it.driver_id) ?? 0;
    if (usados >= 2) continue;
    const slug = mapaDriver.get(it.driver_id);
    if (!slug) continue;
    resultado.push({
      id: it.id,
      image_url: it.image_url,
      caption: it.caption,
      driver_id: it.driver_id,
      driver_slug: slug,
      driver_nome: mapaNome.get(it.driver_id) ?? "Profissional",
    });
    contagem.set(it.driver_id, usados + 1);
    if (resultado.length >= limite) break;
  }
  return resultado;
}

export async function listarPortfolioProfissional(
  driverId: string,
): Promise<ItemPortfolio[]> {
  const { data } = await supabase
    .from("service_portfolio_items" as any)
    .select("id, image_url, caption, service_type_id, ordem")
    .eq("driver_id", driverId)
    .order("ordem", { ascending: true });

  return ((data ?? []) as any[]) as ItemPortfolio[];
}

export async function resolverDriverVitrine(
  tenantSlug: string,
  driverSlug: string,
): Promise<{
  driverId: string;
  tenantId: string;
} | null> {
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .maybeSingle();
  if (!tenant) return null;

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("slug", driverSlug)
    .eq("tenant_id", tenant.id)
    .maybeSingle();
  if (!driver) return null;

  return { driverId: driver.id, tenantId: tenant.id };
}
