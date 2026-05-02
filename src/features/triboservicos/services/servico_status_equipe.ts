import { supabase } from "@/integrations/supabase/client";
import type { MembroEquipe } from "@/features/motorista/types/tipos_vitrine";

export type StatusDisponibilidade = "disponivel" | "ocupado" | "sem_agenda";

export interface MembroEquipePublico extends MembroEquipe {
  status: StatusDisponibilidade;
}

export async function listarEquipePublica(ownerDriverId: string): Promise<MembroEquipe[]> {
  const { data: membros } = await supabase
    .from("professional_team_members" as any)
    .select("id, owner_driver_id, member_driver_id, headline, ordem, tenant_id")
    .eq("owner_driver_id", ownerDriverId)
    .order("ordem", { ascending: true });

  const lista = (membros ?? []) as any[];
  if (lista.length === 0) return [];

  const ids = lista.map((m) => m.member_driver_id);
  const [{ data: drivers }, { data: users }] = await Promise.all([
    supabase
      .from("drivers")
      .select("id, slug, handle, is_verified, credential_verified, service_categories, professional_type")
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
        handle: d.handle ?? null,
        is_verified: d.is_verified,
        credential_verified: !!d.credential_verified,
        service_categories: d.service_categories ?? [],
        professional_type: d.professional_type,
      } as MembroEquipe;
    })
    .filter((x): x is MembroEquipe => x !== null);
}

/**
 * Calcula status de disponibilidade do profissional para o dia atual:
 * - sem_agenda: sem registros em professional_availability para o dia
 * - ocupado: tem agenda mas todos os horários do dia estão preenchidos por bookings ativos
 * - disponivel: tem agenda e ainda há horários livres hoje
 */
export async function calcularStatusDisponibilidade(
  driverIds: string[],
): Promise<Record<string, StatusDisponibilidade>> {
  if (driverIds.length === 0) return {};

  const agora = new Date();
  const diaSemana = agora.getDay();
  const inicioDia = new Date(agora);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(agora);
  fimDia.setHours(23, 59, 59, 999);

  const [{ data: agendas }, { data: bookings }] = await Promise.all([
    supabase
      .from("professional_availability" as any)
      .select("driver_id, start_time, end_time, slot_duration_minutes, is_active")
      .in("driver_id", driverIds)
      .eq("day_of_week", diaSemana)
      .eq("is_active", true),
    supabase
      .from("service_bookings" as any)
      .select("driver_id, scheduled_at, duration_minutes, status")
      .in("driver_id", driverIds)
      .gte("scheduled_at", inicioDia.toISOString())
      .lte("scheduled_at", fimDia.toISOString())
      .in("status", ["pending", "confirmed", "in_progress"]),
  ]);

  const mapaAgenda = new Map<string, any[]>();
  ((agendas ?? []) as any[]).forEach((a) => {
    const arr = mapaAgenda.get(a.driver_id) ?? [];
    arr.push(a);
    mapaAgenda.set(a.driver_id, arr);
  });

  const mapaBookings = new Map<string, any[]>();
  ((bookings ?? []) as any[]).forEach((b) => {
    const arr = mapaBookings.get(b.driver_id) ?? [];
    arr.push(b);
    mapaBookings.set(b.driver_id, arr);
  });

  const resultado: Record<string, StatusDisponibilidade> = {};

  for (const id of driverIds) {
    const agendaDia = mapaAgenda.get(id) ?? [];
    if (agendaDia.length === 0) {
      resultado[id] = "sem_agenda";
      continue;
    }

    // Calcula slots totais do dia
    let slotsTotais = 0;
    for (const a of agendaDia) {
      const [hI, mI] = (a.start_time as string).split(":").map(Number);
      const [hF, mF] = (a.end_time as string).split(":").map(Number);
      const minutos = hF * 60 + mF - (hI * 60 + mI);
      slotsTotais += Math.max(0, Math.floor(minutos / (a.slot_duration_minutes || 60)));
    }
    const ocupados = (mapaBookings.get(id) ?? []).length;
    resultado[id] = ocupados >= slotsTotais && slotsTotais > 0 ? "ocupado" : "disponivel";
  }

  return resultado;
}
