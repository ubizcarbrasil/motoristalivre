import { supabase } from "@/integrations/supabase/client";
import type { TenantOpcao, MotoristaOpcao, DadosSimulacao } from "../types/tipos_simulador";
import { COORDS_FAKE, gerarIdPassageiroFantasma } from "../constants/constantes_simulador";

export async function listarTenants(): Promise<TenantOpcao[]> {
  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listarMotoristasDoTenant(tenantId: string): Promise<MotoristaOpcao[]> {
  const { data: motoristas, error } = await supabase
    .from("drivers")
    .select("id, slug, is_online")
    .eq("tenant_id", tenantId);
  if (error) throw error;
  if (!motoristas?.length) return [];

  const ids = motoristas.map((m) => m.id);
  const { data: usuarios } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", ids);
  const mapa = new Map(usuarios?.map((u) => [u.id, u.full_name]));

  return motoristas
    .map((m) => ({
      id: m.id,
      slug: m.slug,
      is_online: m.is_online,
      nome: mapa.get(m.id) ?? "Motorista",
    }))
    .sort((a, b) => Number(b.is_online) - Number(a.is_online));
}

interface ResultadoSimulacao {
  rideRequestId: string;
  dispatchId: string | null;
}

export async function criarRequestSimulada(dados: DadosSimulacao): Promise<ResultadoSimulacao> {
  const passengerId = gerarIdPassageiroFantasma(dados.tenantId);

  // Garante que existe o passenger fantasma (idempotente)
  await supabase
    .from("passengers")
    .upsert(
      { id: passengerId, tenant_id: dados.tenantId },
      { onConflict: "id" }
    );

  // Cria o ride_request
  const { data: request, error: errRequest } = await supabase
    .from("ride_requests")
    .insert({
      tenant_id: dados.tenantId,
      passenger_id: passengerId,
      status: "pending",
      payment_method: "dinheiro",
      origin_address: dados.origem,
      origin_lat: COORDS_FAKE.origem.lat,
      origin_lng: COORDS_FAKE.origem.lng,
      dest_address: dados.destino,
      dest_lat: COORDS_FAKE.destino.lat,
      dest_lng: COORDS_FAKE.destino.lng,
      distance_km: dados.distanciaKm,
      estimated_min: dados.duracaoMin,
      suggested_price: dados.valor,
      origin_type: "group_link",
    })
    .select("id")
    .single();

  if (errRequest || !request) throw errRequest ?? new Error("Falha ao criar request");

  // Cria dispatch direto pro motorista alvo (não depende do dispatch-mode do tenant)
  const { data: dispatch, error: errDisp } = await supabase
    .from("ride_dispatches")
    .insert({
      ride_request_id: request.id,
      driver_id: dados.motoristaId,
      tenant_id: dados.tenantId,
      attempt_number: 1,
      response: "pending",
    })
    .select("id")
    .single();

  if (errDisp) throw errDisp;

  // Atualiza o status do request para dispatching
  await supabase
    .from("ride_requests")
    .update({ status: "dispatching" })
    .eq("id", request.id);

  return {
    rideRequestId: request.id,
    dispatchId: dispatch?.id ?? null,
  };
}
