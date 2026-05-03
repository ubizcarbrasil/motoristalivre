import { supabase } from "@/integrations/supabase/client";
import type {
  CategoriaFiltro,
  FiltrosDescobertaTribos,
  TriboPublicaListada,
} from "../types/tipos_descoberta_tribos";

export async function listarTribosPublicas(
  filtros: FiltrosDescobertaTribos = {},
): Promise<TriboPublicaListada[]> {
  let query = supabase
    .from("tenants")
    .select(
      "id, slug, name, signup_slug, active_modules, service_category_id, status, is_visible_public",
    )
    .eq("is_visible_public", true)
    .eq("status", "active");

  if (filtros.busca && filtros.busca.trim()) {
    query = query.ilike("name", `%${filtros.busca.trim()}%`);
  }
  if (filtros.limite) query = query.limit(filtros.limite);

  const { data: tenants, error } = await query;
  if (error || !tenants || tenants.length === 0) return [];

  const ids = tenants.map((t) => t.id);
  const categoryIds = tenants
    .map((t) => t.service_category_id)
    .filter((id): id is string => !!id);

  const [{ data: brandings }, { data: categorias }] = await Promise.all([
    supabase
      .from("tenant_branding")
      .select("tenant_id, city, description, logo_url, cover_url")
      .in("tenant_id", ids),
    categoryIds.length
      ? supabase
          .from("service_categories")
          .select("id, slug, nome")
          .in("id", categoryIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const mapaBranding = new Map((brandings ?? []).map((b) => [b.tenant_id, b]));
  const mapaCategoria = new Map((categorias ?? []).map((c: any) => [c.id, c]));

  let resultado: TriboPublicaListada[] = tenants.map((t) => {
    const b = mapaBranding.get(t.id);
    const cat = t.service_category_id ? mapaCategoria.get(t.service_category_id) : null;
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      signupSlug: (t as any).signup_slug ?? null,
      activeModules: (t.active_modules as string[]) ?? [],
      city: b?.city ?? null,
      description: b?.description ?? null,
      logoUrl: b?.logo_url ?? null,
      coverUrl: (b as any)?.cover_url ?? null,
      categoryId: cat?.id ?? null,
      categorySlug: cat?.slug ?? null,
      categoryName: cat?.nome ?? null,
    };
  });

  if (filtros.categoriaSlug) {
    resultado = resultado.filter((r) => r.categorySlug === filtros.categoriaSlug);
  }
  if (filtros.cidade && filtros.cidade.trim()) {
    const alvo = filtros.cidade.trim().toLowerCase();
    resultado = resultado.filter((r) => (r.city ?? "").toLowerCase().includes(alvo));
  }

  return resultado.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listarCategoriasComTribos(): Promise<CategoriaFiltro[]> {
  const tribos = await listarTribosPublicas();
  const mapa = new Map<string, CategoriaFiltro>();
  for (const t of tribos) {
    if (t.categoryId && t.categorySlug && t.categoryName && !mapa.has(t.categorySlug)) {
      mapa.set(t.categorySlug, {
        id: t.categoryId,
        slug: t.categorySlug,
        nome: t.categoryName,
      });
    }
  }
  return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function listarCidadesComTribos(): Promise<string[]> {
  const tribos = await listarTribosPublicas();
  const set = new Set<string>();
  for (const t of tribos) {
    if (t.city && t.city.trim()) set.add(t.city.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
