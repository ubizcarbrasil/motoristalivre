import { supabase } from "@/integrations/supabase/client";
import type { ItemPortfolio, MembroEquipe } from "@/features/motorista/types/tipos_vitrine";

// ============================
// PORTFÓLIO
// ============================

export async function listarPortfolioDoDriver(driverId: string): Promise<ItemPortfolio[]> {
  const { data, error } = await supabase
    .from("service_portfolio_items" as any)
    .select("id, driver_id, service_type_id, image_url, caption, ordem")
    .eq("driver_id", driverId)
    .order("service_type_id", { ascending: true })
    .order("ordem", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as any) as ItemPortfolio[];
}

export async function adicionarItemPortfolio(params: {
  driver_id: string;
  tenant_id: string;
  service_type_id: string;
  image_url: string;
  caption?: string | null;
  ordem?: number;
}) {
  const { error } = await supabase.from("service_portfolio_items" as any).insert({
    driver_id: params.driver_id,
    tenant_id: params.tenant_id,
    service_type_id: params.service_type_id,
    image_url: params.image_url,
    caption: params.caption ?? null,
    ordem: params.ordem ?? 0,
  });
  if (error) throw error;
}

export async function atualizarItemPortfolio(
  id: string,
  patch: { caption?: string | null; ordem?: number; service_type_id?: string },
) {
  const { error } = await supabase
    .from("service_portfolio_items" as any)
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function reordenarItensPortfolio(
  itens: Array<{ id: string; ordem: number }>,
) {
  if (itens.length === 0) return;
  const resultados = await Promise.all(
    itens.map((it) =>
      supabase
        .from("service_portfolio_items" as any)
        .update({ ordem: it.ordem })
        .eq("id", it.id),
    ),
  );
  const erro = resultados.find((r) => r.error);
  if (erro?.error) throw erro.error;
}

export async function removerItemPortfolio(id: string, imageUrl: string) {
  const { error } = await supabase
    .from("service_portfolio_items" as any)
    .delete()
    .eq("id", id);
  if (error) throw error;

  // Tenta remover do storage (best-effort)
  const idx = imageUrl.indexOf("/portfolio/");
  if (idx >= 0) {
    const path = imageUrl.substring(idx + "/portfolio/".length).split("?")[0];
    await supabase.storage.from("portfolio").remove([path]);
  }
}

export async function uploadImagemPortfolio(driverId: string, arquivo: File): Promise<string> {
  const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${driverId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, arquivo, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
  return data.publicUrl;
}

// ============================
// EQUIPE
// ============================

export interface CandidatoEquipe {
  id: string;
  nome: string;
  avatar_url: string | null;
  slug: string;
  professional_type: string;
}

export async function listarEquipeAdmin(ownerDriverId: string): Promise<MembroEquipe[]> {
  const { data: membros, error } = await supabase
    .from("professional_team_members" as any)
    .select("id, owner_driver_id, member_driver_id, headline, ordem")
    .eq("owner_driver_id", ownerDriverId)
    .order("ordem", { ascending: true });
  if (error) throw error;

  const lista = (membros ?? []) as any[];
  if (lista.length === 0) return [];

  const ids = lista.map((m) => m.member_driver_id);
  const [{ data: drivers }, { data: users }] = await Promise.all([
    supabase
      .from("drivers")
      .select("id, slug, is_verified, credential_verified, service_categories, professional_type")
      .in("id", ids),
    supabase.from("users").select("id, full_name, avatar_url").in("id", ids),
  ]);

  const mapaDrivers = new Map(((drivers ?? []) as any[]).map((d) => [d.id, d]));
  const mapaUsers = new Map(((users ?? []) as any[]).map((u) => [u.id, u]));

  return lista
    .map((m) => {
      const d = mapaDrivers.get(m.member_driver_id);
      const u = mapaUsers.get(m.member_driver_id);
      if (!d) return null;
      return {
        id: m.id,
        owner_driver_id: m.owner_driver_id,
        member_driver_id: m.member_driver_id,
        headline: m.headline,
        ordem: m.ordem,
        nome: u?.full_name ?? "Profissional",
        avatar_url: u?.avatar_url ?? null,
        slug: d.slug,
        is_verified: d.is_verified,
        credential_verified: !!d.credential_verified,
        service_categories: d.service_categories ?? [],
        professional_type: d.professional_type,
      } as MembroEquipe;
    })
    .filter((x): x is MembroEquipe => x !== null);
}

export async function buscarCandidatosEquipe(
  tenantId: string,
  ownerDriverId: string,
  termo: string,
): Promise<CandidatoEquipe[]> {
  // Pega já membros para excluir
  const { data: jaMembros } = await supabase
    .from("professional_team_members" as any)
    .select("member_driver_id")
    .eq("owner_driver_id", ownerDriverId);
  const idsExcluir = new Set<string>(
    [ownerDriverId, ...((jaMembros ?? []) as any[]).map((m) => m.member_driver_id)],
  );

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, slug, professional_type")
    .eq("tenant_id", tenantId)
    .limit(50);

  const ids = ((drivers ?? []) as any[])
    .map((d) => d.id)
    .filter((id) => !idsExcluir.has(id));
  if (ids.length === 0) return [];

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, avatar_url")
    .in("id", ids);

  const mapaUsers = new Map(((users ?? []) as any[]).map((u) => [u.id, u]));
  const termoLower = termo.trim().toLowerCase();

  return ((drivers ?? []) as any[])
    .filter((d) => !idsExcluir.has(d.id))
    .map((d) => {
      const u = mapaUsers.get(d.id);
      return {
        id: d.id,
        nome: u?.full_name ?? "Profissional",
        avatar_url: u?.avatar_url ?? null,
        slug: d.slug,
        professional_type: d.professional_type,
      } as CandidatoEquipe;
    })
    .filter((c) => !termoLower || c.nome.toLowerCase().includes(termoLower) || c.slug.includes(termoLower));
}

export async function adicionarMembroEquipe(params: {
  owner_driver_id: string;
  member_driver_id: string;
  tenant_id: string;
  headline?: string | null;
  ordem?: number;
}) {
  const { error } = await supabase.from("professional_team_members" as any).insert({
    owner_driver_id: params.owner_driver_id,
    member_driver_id: params.member_driver_id,
    tenant_id: params.tenant_id,
    headline: params.headline ?? null,
    ordem: params.ordem ?? 0,
  });
  if (error) throw error;
}

export async function removerMembroEquipe(id: string) {
  const { error } = await supabase
    .from("professional_team_members" as any)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ============================
// CATEGORIAS
// ============================

export async function atualizarCategoriasDriver(driverId: string, categorias: string[]) {
  const { error } = await supabase
    .from("drivers")
    .update({ service_categories: categorias })
    .eq("id", driverId);
  if (error) throw error;
}
