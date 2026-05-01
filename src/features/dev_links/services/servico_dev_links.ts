import { supabase } from "@/integrations/supabase/client";
import type { TriboDev } from "../types/tipos_dev_links";

export async function listarTribosDev(): Promise<TriboDev[]> {
  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, slug, name, active_modules")
    .order("created_at", { ascending: false });

  if (error || !tenants) return [];

  const tribos: TriboDev[] = await Promise.all(
    tenants.map(async (t) => {
      const { data: motorista } = await supabase
        .from("drivers")
        .select("slug")
        .eq("tenant_id", t.id)
        .limit(1)
        .maybeSingle();

      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        modulos: (t.active_modules ?? []) as string[],
        motoristaSlug: motorista?.slug ?? null,
      };
    }),
  );

  return tribos;
}
