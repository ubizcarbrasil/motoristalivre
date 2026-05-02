import { supabase } from "@/integrations/supabase/client";
import {
  calcularStatusDisponibilidade,
  listarEquipePublica,
} from "@/features/triboservicos/services/servico_status_equipe";
import type { DonoRede, MembroRedePublica } from "../types/tipos_rede";

export async function resolverDonoRede(
  tenantSlug: string,
  driverSlug: string,
): Promise<DonoRede | null> {
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .maybeSingle();
  if (!tenant) return null;

  const { data: driver } = await supabase
    .from("drivers")
    .select("id, slug")
    .eq("tenant_id", tenant.id)
    .eq("slug", driverSlug)
    .maybeSingle();
  if (!driver) return null;

  const { data: usuario } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", driver.id)
    .maybeSingle();

  return {
    driverId: driver.id,
    driverSlug: driver.slug,
    nome: usuario?.full_name ?? "Profissional",
    avatarUrl: usuario?.avatar_url ?? null,
  };
}

export async function listarRedePublica(
  ownerDriverId: string,
): Promise<MembroRedePublica[]> {
  const membros = await listarEquipePublica(ownerDriverId);
  if (membros.length === 0) return [];

  const ids = membros.map((m) => m.member_driver_id);
  const status = await calcularStatusDisponibilidade(ids);

  return membros.map((m) => ({
    ...m,
    status: status[m.member_driver_id] ?? "sem_agenda",
  }));
}
