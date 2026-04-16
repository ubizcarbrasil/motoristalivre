import { supabase } from "@/integrations/supabase/client";
import type {
  EstatisticasHoje,
  CorridaRecente,
  DispatchAtivo,
  PerfilMotorista,
  ReputacaoMotorista,
  AvaliacaoRecente,
  MotoristaRanking,
  TransacaoCarteira,
  SaldoCarteira,
} from "../types/tipos_painel";

export async function buscarPerfilMotorista(userId: string): Promise<PerfilMotorista | null> {
  const { data: driver } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!driver) return null;

  const { data: user } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  return {
    id: driver.id,
    nome: user?.full_name ?? "Motorista",
    avatar_url: user?.avatar_url ?? null,
    bio: driver.bio,
    cover_url: driver.cover_url,
    vehicle_model: driver.vehicle_model,
    vehicle_year: driver.vehicle_year,
    vehicle_color: driver.vehicle_color,
    vehicle_plate: driver.vehicle_plate,
    is_online: driver.is_online,
    is_verified: driver.is_verified,
    slug: driver.slug,
    cashback_pct: driver.cashback_pct ?? 0,
    custom_base_fare: driver.custom_base_fare,
    custom_price_per_km: driver.custom_price_per_km,
    custom_price_per_min: driver.custom_price_per_min,
  };
}

export async function buscarEstatisticasHoje(userId: string): Promise<EstatisticasHoje> {
  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);

  const { data: rides } = await supabase
    .from("rides")
    .select("price_paid, cashback_amount, driver_rating")
    .eq("driver_id", userId)
    .gte("created_at", hojeInicio.toISOString());

  const faturamento = rides?.reduce((a, r) => a + (r.price_paid ?? 0), 0) ?? 0;
  const corridas = rides?.length ?? 0;
  const comissoes = rides?.reduce((a, r) => a + (r.cashback_amount ?? 0), 0) ?? 0;

  const { data: allRides } = await supabase
    .from("rides")
    .select("driver_rating")
    .eq("driver_id", userId)
    .not("driver_rating", "is", null);

  const avaliacao = allRides && allRides.length > 0
    ? allRides.reduce((a, r) => a + (r.driver_rating ?? 0), 0) / allRides.length
    : 0;

  return { faturamento, corridas, comissoes, avaliacao };
}

export async function buscarCorridasRecentes(userId: string): Promise<CorridaRecente[]> {
  const { data: rides } = await supabase
    .from("rides")
    .select("id, price_paid, created_at, ride_request_id, origin_driver_id, origin_affiliate_id")
    .eq("driver_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!rides) return [];

  const requestIds = rides.map((r) => r.ride_request_id);
  const { data: requests } = await supabase
    .from("ride_requests")
    .select("id, origin_address, dest_address, origin_type")
    .in("id", requestIds);

  const requestMap = new Map(requests?.map((r) => [r.id, r]) ?? []);

  return rides.map((r) => {
    const req = requestMap.get(r.ride_request_id);
    return {
      id: r.id,
      origem_endereco: req?.origin_address ?? "—",
      destino_endereco: req?.dest_address ?? "—",
      valor: r.price_paid ?? 0,
      origem_tipo: req?.origin_type ?? null,
      origem_nome: r.origin_driver_id ? "via motorista" : r.origin_affiliate_id ? "via afiliado" : "direto",
      created_at: r.created_at,
    };
  });
}

export async function buscarDispatchAtivo(userId: string): Promise<DispatchAtivo | null> {
  const { data: dispatch } = await supabase
    .from("ride_dispatches")
    .select("id, ride_request_id, dispatched_at")
    .eq("driver_id", userId)
    .eq("response", "pending")
    .order("dispatched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!dispatch) return null;

  const { data: req } = await supabase
    .from("ride_requests")
    .select("origin_address, dest_address, distance_km, estimated_min, suggested_price, origin_type, origin_driver_id, origin_affiliate_id")
    .eq("id", dispatch.ride_request_id)
    .maybeSingle();

  if (!req) return null;

  return {
    id: dispatch.id,
    ride_request_id: dispatch.ride_request_id,
    origem_endereco: req.origin_address ?? "—",
    destino_endereco: req.dest_address ?? "—",
    distancia_km: req.distance_km ?? 0,
    duracao_min: req.estimated_min ?? 0,
    valor: req.suggested_price ?? 0,
    origem_tipo: req.origin_type,
    origem_nome: req.origin_driver_id ? "Link de motorista" : req.origin_affiliate_id ? "Link de afiliado" : "Direto",
    dispatched_at: dispatch.dispatched_at,
  };
}

export async function buscarReputacao(userId: string): Promise<ReputacaoMotorista> {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("driver_id", userId);

  const total = reviews?.length ?? 0;
  const distribuicao = [0, 0, 0, 0, 0];
  let soma = 0;

  reviews?.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribuicao[r.rating - 1]++;
      soma += r.rating;
    }
  });

  const { data: dispatches } = await supabase
    .from("ride_dispatches")
    .select("response")
    .eq("driver_id", userId);

  const totalDispatches = dispatches?.length ?? 0;
  const aceitos = dispatches?.filter((d) => d.response === "accepted").length ?? 0;
  const taxaAceite = totalDispatches > 0 ? (aceitos / totalDispatches) * 100 : 100;

  const { data: driver } = await supabase
    .from("drivers")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();

  const mesesAtuacao = driver
    ? Math.max(1, Math.floor((Date.now() - new Date(driver.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)))
    : 1;

  return {
    notaMedia: total > 0 ? soma / total : 0,
    totalAvaliacoes: total,
    distribuicao,
    taxaAceite,
    mesesAtuacao,
  };
}

export async function buscarAvaliacoesRecentes(userId: string): Promise<AvaliacaoRecente[]> {
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("driver_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return data ?? [];
}

export async function buscarRankingMotoristas(tenantId: string): Promise<MotoristaRanking[]> {
  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, slug")
    .eq("tenant_id", tenantId)
    .limit(20);

  if (!drivers) return [];

  const resultado: MotoristaRanking[] = [];

  for (const d of drivers) {
    const { data: user } = await supabase
      .from("users")
      .select("full_name, avatar_url")
      .eq("id", d.id)
      .maybeSingle();

    const { data: rides } = await supabase
      .from("rides")
      .select("price_paid")
      .eq("driver_id", d.id);

    resultado.push({
      id: d.id,
      nome: user?.full_name ?? "Motorista",
      avatar_url: user?.avatar_url ?? null,
      corridas: rides?.length ?? 0,
      faturamento: rides?.reduce((a, r) => a + (r.price_paid ?? 0), 0) ?? 0,
    });
  }

  return resultado.sort((a, b) => b.faturamento - a.faturamento);
}

export async function buscarSaldoCarteira(userId: string): Promise<SaldoCarteira> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance, blocked_balance, total_earned, total_withdrawn")
    .eq("owner_id", userId)
    .maybeSingle();

  return {
    saldo: wallet?.balance ?? 0,
    bloqueado: wallet?.blocked_balance ?? 0,
    totalGanho: wallet?.total_earned ?? 0,
    totalSacado: wallet?.total_withdrawn ?? 0,
  };
}

export async function buscarTransacoes(userId: string): Promise<TransacaoCarteira[]> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (!wallet) return [];

  const { data } = await supabase
    .from("wallet_transactions")
    .select("id, type, amount, description, created_at, balance_after")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []).map((t) => ({
    id: t.id,
    tipo: t.type,
    valor: t.amount,
    descricao: t.description,
    created_at: t.created_at,
    saldo_apos: t.balance_after,
  }));
}

export async function alternarOnline(userId: string, online: boolean) {
  await supabase
    .from("drivers")
    .update({ is_online: online })
    .eq("id", userId);
}

export async function buscarTenantDoMotorista(userId: string) {
  const { data } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("id", data.tenant_id)
    .maybeSingle();

  return tenant;
}

export async function buscarConfigPrecoTenant(tenantId: string) {
  const { data } = await supabase
    .from("tenant_settings")
    .select("base_fare, price_per_km, price_per_min, min_fare, cashback_pct, allow_driver_pricing")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return data;
}
