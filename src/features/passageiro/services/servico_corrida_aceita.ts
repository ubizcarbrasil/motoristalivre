import { supabase } from "@/integrations/supabase/client";
import type { MotoristaCorrida, AvaliacaoMotorista } from "../types/tipos_passageiro";

export async function buscarMotoristaPorId(driverId: string): Promise<MotoristaCorrida | null> {
  const { data: driver } = await supabase
    .from("drivers")
    .select("id, slug, is_online, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, tenant_id")
    .eq("id", driverId)
    .maybeSingle();

  if (!driver) return null;

  const { data: user } = await supabase
    .from("users")
    .select("full_name, avatar_url, phone")
    .eq("id", driverId)
    .maybeSingle();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("driver_id", driverId);

  const notaMedia = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const { count: totalCorridas } = await supabase
    .from("rides")
    .select("id", { count: "exact", head: true })
    .eq("driver_id", driverId);

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, slug")
    .eq("id", driver.tenant_id)
    .maybeSingle();

  return {
    id: driver.id,
    nome: user?.full_name ?? "Motorista",
    handle: driver.slug,
    avatar_url: user?.avatar_url ?? null,
    telefone: user?.phone ?? null,
    nota_media: notaMedia,
    total_corridas: totalCorridas ?? 0,
    is_online: driver.is_online,
    grupos: tenant ? [{ handle: tenant.slug, nome: tenant.name }] : [],
    veiculo: {
      modelo: driver.vehicle_model,
      ano: driver.vehicle_year,
      cor: driver.vehicle_color,
      placa: driver.vehicle_plate,
    },
  };
}

export async function buscarAvaliacoesMotorista(driverId: string, limite = 3): Promise<AvaliacaoMotorista[]> {
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })
    .limit(limite);

  return data ?? [];
}
