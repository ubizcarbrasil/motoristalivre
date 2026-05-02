import { supabase } from "@/integrations/supabase/client";
import type {
  TipoServico,
  DisponibilidadeProfissional,
  AgendamentoServico,
  AgendamentoComCliente,
} from "../types/tipos_servicos";

export async function listarServicosPorMotorista(driverId: string): Promise<TipoServico[]> {
  const { data, error } = await supabase
    .from("service_types" as any)
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as TipoServico[];
}

export async function criarServico(input: {
  driver_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_immediate?: boolean;
}): Promise<TipoServico> {
  const { data, error } = await supabase
    .from("service_types" as any)
    .insert(input as any)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as TipoServico;
}

export async function atualizarServico(id: string, patch: Partial<TipoServico>): Promise<void> {
  const { error } = await supabase
    .from("service_types" as any)
    .update(patch as any)
    .eq("id", id);
  if (error) throw error;
}

export async function excluirServico(id: string): Promise<void> {
  const { error } = await supabase.from("service_types" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function listarDisponibilidade(driverId: string): Promise<DisponibilidadeProfissional[]> {
  const { data, error } = await supabase
    .from("professional_availability" as any)
    .select("*")
    .eq("driver_id", driverId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as DisponibilidadeProfissional[];
}

export async function criarBlocoDisponibilidade(input: {
  driver_id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
}): Promise<DisponibilidadeProfissional> {
  const { data, error } = await supabase
    .from("professional_availability" as any)
    .insert(input as any)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as DisponibilidadeProfissional;
}

export async function excluirBlocoDisponibilidade(id: string): Promise<void> {
  const { error } = await supabase.from("professional_availability" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function salvarDisponibilidadeEmMassa(input: {
  driver_id: string;
  tenant_id: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  blocos: Array<{ day_of_week: number; start_time: string; end_time: string }>;
}): Promise<void> {
  const { error } = await supabase.rpc("replace_provider_availability" as any, {
    _driver_id: input.driver_id,
    _tenant_id: input.tenant_id,
    _slot_min: input.slot_duration_minutes,
    _buffer_min: input.buffer_minutes,
    _blocos: input.blocos as any,
  });
  if (error) throw error;
}

export async function listarBloqueiosAgenda(driverId: string) {
  const { data, error } = await supabase
    .from("provider_time_off" as any)
    .select("*")
    .eq("driver_id", driverId)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function criarBloqueioAgenda(input: {
  driver_id: string;
  tenant_id: string;
  starts_at: string;
  ends_at: string;
  reason?: string | null;
  all_day?: boolean;
}): Promise<void> {
  const { error } = await supabase.from("provider_time_off" as any).insert(input as any);
  if (error) throw error;
}

export async function excluirBloqueioAgenda(id: string): Promise<void> {
  const { error } = await supabase.from("provider_time_off" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function atualizarAceitandoAgendamentos(driverId: string, aceitando: boolean) {
  const { error } = await supabase
    .from("drivers")
    .update({ accepting_bookings: aceitando } as any)
    .eq("id", driverId);
  if (error) throw error;
}

export async function listarAgendamentosDoDia(
  driverId: string,
  dataIso: string,
): Promise<AgendamentoComCliente[]> {
  const inicio = new Date(dataIso);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);

  const { data: bookings, error } = await supabase
    .from("service_bookings" as any)
    .select("*")
    .eq("driver_id", driverId)
    .gte("scheduled_at", inicio.toISOString())
    .lt("scheduled_at", fim.toISOString())
    .order("scheduled_at", { ascending: true });
  if (error) throw error;

  const lista = (bookings ?? []) as unknown as AgendamentoServico[];
  if (lista.length === 0) return [];

  // Resolver nomes de cliente e serviço
  const serviceIds = [...new Set(lista.map((b) => b.service_type_id))];
  const clientIds = [...new Set(lista.map((b) => b.client_id).filter(Boolean) as string[])];
  const guestIds = [...new Set(lista.map((b) => b.guest_passenger_id).filter(Boolean) as string[])];

  const [{ data: services }, { data: users }, { data: guests }] = await Promise.all([
    supabase.from("service_types" as any).select("id, name").in("id", serviceIds),
    clientIds.length
      ? supabase.from("users").select("id, full_name").in("id", clientIds)
      : Promise.resolve({ data: [] as any[] }),
    guestIds.length
      ? supabase.from("guest_passengers").select("id, full_name").in("id", guestIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const mapaServicos = new Map(((services as any[]) ?? []).map((s: any) => [s.id, s.name]));
  const mapaUsers = new Map((users ?? []).map((u: any) => [u.id, u.full_name]));
  const mapaGuests = new Map((guests ?? []).map((g: any) => [g.id, g.full_name]));

  return lista.map((b) => ({
    ...b,
    cliente_nome:
      (b.client_id ? mapaUsers.get(b.client_id) : mapaGuests.get(b.guest_passenger_id ?? "")) ??
      "Cliente",
    servico_nome: mapaServicos.get(b.service_type_id) ?? "Serviço",
  }));
}

export async function listarAgendamentosFuturos(
  driverId: string,
): Promise<AgendamentoServico[]> {
  const { data, error } = await supabase
    .from("service_bookings" as any)
    .select("*")
    .eq("driver_id", driverId)
    .in("status", ["confirmed", "pending", "in_progress"])
    .gte("scheduled_at", new Date().toISOString());
  if (error) throw error;
  return (data ?? []) as unknown as AgendamentoServico[];
}

export async function chamarBookService(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("book-service", { body: payload });
  if (error) throw error;
  return data as { booking: AgendamentoServico };
}
