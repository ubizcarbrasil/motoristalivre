import { supabase } from "@/integrations/supabase/client";
import type {
  AvaliacaoEnviada,
  CorridaHistorico,
  DadosPerfilPassageiro,
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
