import { supabase } from "@/integrations/supabase/client";
import type { EnderecoRecente } from "../types/tipos_recentes";

const LIMITE_BUSCA = 30;
const LIMITE_RETORNO = 5;
const PRECISAO_COORDENADA = 4;

function chaveLocalizacao(lat: number, lng: number): string {
  return `${lat.toFixed(PRECISAO_COORDENADA)},${lng.toFixed(PRECISAO_COORDENADA)}`;
}

export async function listarDestinosRecentes(passengerId: string): Promise<EnderecoRecente[]> {
  const { data, error } = await supabase
    .from("ride_requests")
    .select("dest_address, dest_lat, dest_lng, created_at")
    .eq("passenger_id", passengerId)
    .not("dest_address", "is", null)
    .not("dest_lat", "is", null)
    .not("dest_lng", "is", null)
    .order("created_at", { ascending: false })
    .limit(LIMITE_BUSCA);

  if (error || !data) return [];

  const vistos = new Set<string>();
  const recentes: EnderecoRecente[] = [];

  for (const r of data) {
    if (!r.dest_address || r.dest_lat === null || r.dest_lng === null) continue;
    const lat = Number(r.dest_lat);
    const lng = Number(r.dest_lng);
    const chave = chaveLocalizacao(lat, lng);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    recentes.push({
      address: r.dest_address,
      lat,
      lng,
      ultimaUtilizacao: r.created_at,
    });
    if (recentes.length >= LIMITE_RETORNO) break;
  }

  return recentes;
}
