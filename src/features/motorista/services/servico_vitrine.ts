import { supabase } from "@/integrations/supabase/client";
import type { ItemPortfolio, MembroEquipe } from "../types/tipos_vitrine";

export async function listarPortfolioPorMotorista(driverId: string): Promise<ItemPortfolio[]> {
  const { data } = await supabase
    .from("service_portfolio_items" as any)
    .select("id, driver_id, service_type_id, image_url, caption, ordem")
    .eq("driver_id", driverId)
    .order("service_type_id", { ascending: true })
    .order("ordem", { ascending: true });
  return ((data ?? []) as any) as ItemPortfolio[];
}

export async function listarEquipeDoMotorista(ownerDriverId: string): Promise<MembroEquipe[]> {
  const { data: membros } = await supabase
    .from("professional_team_members" as any)
    .select("id, owner_driver_id, member_driver_id, headline, ordem")
    .eq("owner_driver_id", ownerDriverId)
    .order("ordem", { ascending: true });

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
