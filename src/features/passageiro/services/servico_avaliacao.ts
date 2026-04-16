import { supabase } from "@/integrations/supabase/client";

export interface DadosAvaliacao {
  ride_id: string;
  driver_id: string;
  passenger_id: string;
  tenant_id: string;
  rating: number;
  comment: string | null;
}

export async function enviarAvaliacao(dados: DadosAvaliacao): Promise<void> {
  const { error } = await supabase.from("reviews").insert({
    ride_id: dados.ride_id,
    driver_id: dados.driver_id,
    passenger_id: dados.passenger_id,
    tenant_id: dados.tenant_id,
    rating: dados.rating,
    comment: dados.comment?.trim() || null,
  });

  if (error) throw error;
}

export async function buscarTenantDaCorrida(rideId: string): Promise<string | null> {
  const { data } = await supabase
    .from("rides")
    .select("tenant_id")
    .eq("id", rideId)
    .maybeSingle();
  return data?.tenant_id ?? null;
}

export async function existeAvaliacao(rideId: string, passengerId: string): Promise<boolean> {
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("ride_id", rideId)
    .eq("passenger_id", passengerId)
    .maybeSingle();
  return !!data;
}
