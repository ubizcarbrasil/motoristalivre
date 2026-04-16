import { supabase } from "@/integrations/supabase/client";
import type {
  AvaliacaoEnviada,
  CorridaHistorico,
  DadosPerfilPassageiro,
  DetalhesCorrida,
  StatusCorrida,
} from "../types/tipos_perfil_passageiro";

export async function buscarPerfilPassageiro(userId: string): Promise<DadosPerfilPassageiro | null> {
  const [usuarioRes, passageiroRes] = await Promise.all([
    supabase.from("users").select("id, full_name, email, phone, avatar_url").eq("id", userId).maybeSingle(),
    supabase.from("passengers").select("total_rides, total_spent, cashback_balance").eq("id", userId).maybeSingle(),
  ]);

  if (!usuarioRes.data) return null;

  return {
    id: usuarioRes.data.id,
    full_name: usuarioRes.data.full_name,
    email: usuarioRes.data.email,
    phone: usuarioRes.data.phone,
    avatar_url: usuarioRes.data.avatar_url,
    total_rides: passageiroRes.data?.total_rides ?? 0,
    total_spent: Number(passageiroRes.data?.total_spent ?? 0),
    cashback_balance: Number(passageiroRes.data?.cashback_balance ?? 0),
  };
}

export async function buscarAvaliacoesEnviadas(passengerId: string): Promise<AvaliacaoEnviada[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, ride_id, driver_id")
    .eq("passenger_id", passengerId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  const driverIds = Array.from(new Set(data.map((r) => r.driver_id)));
  const { data: drivers } = await supabase
    .from("users")
    .select("id, full_name, avatar_url")
    .in("id", driverIds);

  const mapaDrivers = new Map((drivers ?? []).map((d) => [d.id, d]));

  return data.map((r) => {
    const driver = mapaDrivers.get(r.driver_id);
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      ride_id: r.ride_id,
      motorista_nome: driver?.full_name ?? "Motorista",
      motorista_avatar: driver?.avatar_url ?? null,
    };
  });
}

export async function buscarHistoricoCorridas(passengerId: string): Promise<CorridaHistorico[]> {
  const [ridesRes, requestsRes] = await Promise.all([
    supabase
      .from("rides")
      .select("id, created_at, completed_at, price_paid, driver_id, ride_request_id")
      .eq("passenger_id", passengerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("ride_requests")
      .select("id, created_at, status, origin_address, dest_address, final_price, offered_price, suggested_price")
      .eq("passenger_id", passengerId)
      .order("created_at", { ascending: false }),
  ]);

  const rides = ridesRes.data ?? [];
  const requests = requestsRes.data ?? [];

  const driverIds = Array.from(new Set(rides.map((r) => r.driver_id).filter(Boolean)));
  const mapaDrivers = new Map<string, { full_name: string | null; avatar_url: string | null }>();
  if (driverIds.length > 0) {
    const { data: drivers } = await supabase
      .from("users")
      .select("id, full_name, avatar_url")
      .in("id", driverIds);
    (drivers ?? []).forEach((d) => mapaDrivers.set(d.id, d));
  }

  const mapaRequests = new Map(requests.map((r) => [r.id, r]));
  const requestIdsUsados = new Set<string>();

  const corridasConcluidas: CorridaHistorico[] = rides.map((r) => {
    requestIdsUsados.add(r.ride_request_id);
    const req = mapaRequests.get(r.ride_request_id);
    const driver = mapaDrivers.get(r.driver_id);
    return {
      id: r.id,
      ride_request_id: r.ride_request_id,
      created_at: r.created_at,
      completed_at: r.completed_at,
      status: (req?.status as StatusCorrida) ?? "completed",
      price_paid: r.price_paid !== null ? Number(r.price_paid) : null,
      origin_address: req?.origin_address ?? null,
      dest_address: req?.dest_address ?? null,
      motorista_id: r.driver_id,
      motorista_nome: driver?.full_name ?? "Motorista",
      motorista_avatar: driver?.avatar_url ?? null,
    };
  });

  const corridasSemMotorista: CorridaHistorico[] = requests
    .filter((r) => !requestIdsUsados.has(r.id))
    .map((r) => ({
      id: r.id,
      ride_request_id: r.id,
      created_at: r.created_at,
      completed_at: null,
      status: r.status as StatusCorrida,
      price_paid:
        r.final_price !== null
          ? Number(r.final_price)
          : r.offered_price !== null
          ? Number(r.offered_price)
          : r.suggested_price !== null
          ? Number(r.suggested_price)
          : null,
      origin_address: r.origin_address,
      dest_address: r.dest_address,
      motorista_id: null,
      motorista_nome: "—",
      motorista_avatar: null,
    }));

  return [...corridasConcluidas, ...corridasSemMotorista].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
