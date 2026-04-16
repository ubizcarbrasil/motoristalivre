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
    supabase.from("users").select("id, full_name, email, phone, avatar_url, tenant_id").eq("id", userId).maybeSingle(),
    supabase.from("passengers").select("total_rides, total_spent, cashback_balance").eq("id", userId).maybeSingle(),
  ]);

  if (!usuarioRes.data) return null;

  return {
    id: usuarioRes.data.id,
    full_name: usuarioRes.data.full_name,
    email: usuarioRes.data.email,
    phone: usuarioRes.data.phone,
    avatar_url: usuarioRes.data.avatar_url,
    tenant_id: usuarioRes.data.tenant_id,
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

export async function buscarDetalhesCorrida(
  rideId: string,
  isRideRequest: boolean
): Promise<DetalhesCorrida | null> {
  let ride: {
    id: string;
    ride_request_id: string | null;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    price_paid: number | null;
    payment_method: string | null;
    driver_id: string | null;
  } | null = null;

  if (!isRideRequest) {
    const { data } = await supabase
      .from("rides")
      .select("id, ride_request_id, created_at, started_at, completed_at, price_paid, payment_method, driver_id")
      .eq("id", rideId)
      .maybeSingle();
    if (!data) return null;
    ride = {
      id: data.id,
      ride_request_id: data.ride_request_id,
      created_at: data.created_at,
      started_at: data.started_at,
      completed_at: data.completed_at,
      price_paid: data.price_paid !== null ? Number(data.price_paid) : null,
      payment_method: data.payment_method,
      driver_id: data.driver_id,
    };
  }

  const requestId = ride?.ride_request_id ?? rideId;
  const { data: req } = await supabase
    .from("ride_requests")
    .select(
      "id, created_at, status, payment_method, distance_km, estimated_min, final_price, offered_price, suggested_price, origin_address, dest_address, origin_lat, origin_lng, dest_lat, dest_lng"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (!req && !ride) return null;

  let motoristaInfo = {
    id: ride?.driver_id ?? null,
    nome: "—",
    avatar: null as string | null,
    telefone: null as string | null,
    veiculo_modelo: null as string | null,
    veiculo_placa: null as string | null,
    veiculo_cor: null as string | null,
  };

  if (ride?.driver_id) {
    const [userRes, driverRes] = await Promise.all([
      supabase
        .from("users")
        .select("full_name, avatar_url, phone")
        .eq("id", ride.driver_id)
        .maybeSingle(),
      supabase
        .from("drivers")
        .select("vehicle_model, vehicle_plate, vehicle_color")
        .eq("id", ride.driver_id)
        .maybeSingle(),
    ]);
    motoristaInfo = {
      id: ride.driver_id,
      nome: userRes.data?.full_name ?? "Motorista",
      avatar: userRes.data?.avatar_url ?? null,
      telefone: userRes.data?.phone ?? null,
      veiculo_modelo: driverRes.data?.vehicle_model ?? null,
      veiculo_placa: driverRes.data?.vehicle_plate ?? null,
      veiculo_cor: driverRes.data?.vehicle_color ?? null,
    };
  }

  const startedAt = ride?.started_at ? new Date(ride.started_at).getTime() : null;
  const completedAt = ride?.completed_at ? new Date(ride.completed_at).getTime() : null;
  const durationMin = startedAt && completedAt ? Math.max(1, Math.round((completedAt - startedAt) / 60000)) : null;

  const pricePaid =
    ride?.price_paid ??
    (req?.final_price !== null && req?.final_price !== undefined
      ? Number(req.final_price)
      : req?.offered_price !== null && req?.offered_price !== undefined
      ? Number(req.offered_price)
      : req?.suggested_price !== null && req?.suggested_price !== undefined
      ? Number(req.suggested_price)
      : null);

  return {
    id: ride?.id ?? requestId,
    ride_request_id: requestId,
    created_at: ride?.created_at ?? req?.created_at ?? new Date().toISOString(),
    started_at: ride?.started_at ?? null,
    completed_at: ride?.completed_at ?? null,
    status: (req?.status as StatusCorrida) ?? (ride?.completed_at ? "completed" : "pending"),
    price_paid: pricePaid,
    payment_method: ride?.payment_method ?? req?.payment_method ?? null,
    distance_km: req?.distance_km !== null && req?.distance_km !== undefined ? Number(req.distance_km) : null,
    estimated_min: req?.estimated_min ?? null,
    duration_min: durationMin,
    origin_address: req?.origin_address ?? null,
    dest_address: req?.dest_address ?? null,
    origin_lat: req?.origin_lat !== null && req?.origin_lat !== undefined ? Number(req.origin_lat) : null,
    origin_lng: req?.origin_lng !== null && req?.origin_lng !== undefined ? Number(req.origin_lng) : null,
    dest_lat: req?.dest_lat !== null && req?.dest_lat !== undefined ? Number(req.dest_lat) : null,
    dest_lng: req?.dest_lng !== null && req?.dest_lng !== undefined ? Number(req.dest_lng) : null,
    motorista: motoristaInfo,
  };
}
