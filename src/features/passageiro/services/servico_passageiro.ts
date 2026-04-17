import { supabase } from "@/integrations/supabase/client";
import type { DadosMotorista, DadosAfiliado, ConfigPreco, DadosRota, Coordenada, MotoristaListado } from "../types/tipos_passageiro";
import { NOMINATIM_URL } from "../constants/constantes_passageiro";

export async function buscarTenantPorSlug(tenantSlug: string): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", tenantSlug)
    .maybeSingle();
  return data ?? null;
}

export async function listarMotoristasDoTenant(tenantSlug: string): Promise<MotoristaListado[]> {
  const tenant = await buscarTenantPorSlug(tenantSlug);
  if (!tenant) return [];

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, slug, is_online, is_verified")
    .eq("tenant_id", tenant.id)
    .order("is_online", { ascending: false });

  if (!drivers || drivers.length === 0) return [];

  const ids = drivers.map((d) => d.id);
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, avatar_url")
    .in("id", ids);

  const mapaUsers = new Map((users ?? []).map((u) => [u.id, u]));

  return drivers.map((d) => ({
    id: d.id,
    slug: d.slug,
    nome: mapaUsers.get(d.id)?.full_name ?? "Motorista",
    avatar_url: mapaUsers.get(d.id)?.avatar_url ?? null,
    is_online: d.is_online,
    is_verified: d.is_verified,
    tenant_slug: tenantSlug,
  }));
}

export async function buscarMotorista(tenantSlug: string, motoristaSlug: string): Promise<DadosMotorista | null> {
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) return null;

  const { data: driver } = await supabase
    .from("drivers")
    .select("id, slug, bio, is_online, is_verified, tenant_id")
    .eq("slug", motoristaSlug)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (!driver) return null;

  const { data: user } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", driver.id)
    .maybeSingle();

  // Buscar nota média
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("driver_id", driver.id);

  const nota = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : null;

  return {
    id: driver.id,
    nome: user?.full_name ?? "Motorista",
    avatar_url: user?.avatar_url ?? null,
    slug: driver.slug,
    nota,
    is_online: driver.is_online,
    grupo_nome: tenant.name,
    tenant_id: tenant.id,
  };
}

export async function buscarAfiliado(tenantSlug: string, afiliadoSlug: string): Promise<DadosAfiliado | null> {
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) return null;

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, slug, business_name, tenant_id")
    .eq("slug", afiliadoSlug)
    .eq("tenant_id", tenant.id)
    .eq("is_approved", true)
    .maybeSingle();

  if (!affiliate) return null;

  const { data: user } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", affiliate.id)
    .maybeSingle();

  return {
    id: affiliate.id,
    nome: user?.full_name ?? "Afiliado",
    slug: affiliate.slug,
    business_name: affiliate.business_name,
    grupo_nome: tenant.name,
    tenant_id: tenant.id,
  };
}

export async function buscarConfigPreco(tenantId: string): Promise<ConfigPreco> {
  const { data } = await supabase
    .from("tenant_settings")
    .select("base_fare, price_per_km, price_per_min, min_fare")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return {
    bandeira: data?.base_fare ?? 5,
    preco_por_km: data?.price_per_km ?? 2,
    preco_por_min: data?.price_per_min ?? 0.5,
    tarifa_minima: data?.min_fare ?? 7,
  };
}

export async function buscarEnderecosNominatim(query: string): Promise<Array<{ endereco: string; lat: number; lng: number }>> {
  if (query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: "5",
    countrycodes: "br",
  });

  const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
    headers: { "Accept-Language": "pt-BR" },
  });

  if (!res.ok) return [];

  const dados = await res.json();
  return dados.map((item: { display_name: string; lat: string; lon: string }) => ({
    endereco: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

// Cache em memória + sessionStorage para reverse-geocoding
const cacheReverse = new Map<string, string>();
const REVERSE_CACHE_PREFIX = "tribocar_rev_";

function chaveReverse(lat: number, lng: number) {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

export async function reverseGeocodingNominatim(lat: number, lng: number): Promise<string | null> {
  const chave = chaveReverse(lat, lng);

  // 1. Memória
  if (cacheReverse.has(chave)) return cacheReverse.get(chave) ?? null;

  // 2. sessionStorage
  try {
    const cached = sessionStorage.getItem(REVERSE_CACHE_PREFIX + chave);
    if (cached) {
      cacheReverse.set(chave, cached);
      return cached;
    }
  } catch {
    // ignore
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
    zoom: "18",
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
      headers: { "Accept-Language": "pt-BR" },
    });
    if (!res.ok) return null;
    const dados = await res.json();
    const endereco = (dados?.display_name as string) ?? null;
    if (endereco) {
      cacheReverse.set(chave, endereco);
      try {
        sessionStorage.setItem(REVERSE_CACHE_PREFIX + chave, endereco);
      } catch {
        // ignore quota
      }
    }
    return endereco;
  } catch {
    return null;
  }
}

export interface CriarCorridaGuestParams {
  tenantId: string;
  fullName: string;
  whatsapp: string;
  origem: { lat: number; lng: number; endereco: string };
  destino: { lat: number; lng: number; endereco: string };
  distanciaKm: number;
  duracaoMin: number;
  valorOferta: number;
  formaPagamento: "dinheiro" | "pix" | "cartao" | "saldo";
  origemTipo: "driver_link" | "affiliate_link" | "group_link";
  origemDriverId?: string | null;
  origemAfiliadoId?: string | null;
}

export async function criarCorridaGuest(
  params: CriarCorridaGuestParams
): Promise<{ guest_passenger_id: string; ride_request_id: string }> {
  const { supabase } = await import("@/integrations/supabase/client");

  const { data, error } = await supabase.rpc("create_guest_ride_request", {
    _tenant_id: params.tenantId,
    _full_name: params.fullName,
    _whatsapp: params.whatsapp,
    _origin_lat: params.origem.lat,
    _origin_lng: params.origem.lng,
    _origin_address: params.origem.endereco,
    _dest_lat: params.destino.lat,
    _dest_lng: params.destino.lng,
    _dest_address: params.destino.endereco,
    _distance_km: params.distanciaKm,
    _estimated_min: params.duracaoMin,
    _offered_price: params.valorOferta,
    _suggested_price: params.valorOferta,
    _payment_method: params.formaPagamento,
    _origin_type: params.origemTipo,
    _origin_driver_id: params.origemDriverId ?? null,
    _origin_affiliate_id: params.origemAfiliadoId ?? null,
  });

  if (error) throw error;
  return data as { guest_passenger_id: string; ride_request_id: string };
}

export async function buscarRota(origem: Coordenada, destino: Coordenada): Promise<DadosRota | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origem.lng},${origem.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const dados = await res.json();
    const rota = dados.routes?.[0];
    if (!rota) return null;

    const pontos: Coordenada[] = rota.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    return {
      distancia_km: rota.distance / 1000,
      duracao_min: Math.ceil(rota.duration / 60),
      pontos,
    };
  } catch {
    return null;
  }
}

export function calcularPreco(
  config: ConfigPreco,
  distancia_km: number,
  duracao_min: number,
  multiplicador: number
): number {
  const preco = (config.bandeira + distancia_km * config.preco_por_km + duracao_min * config.preco_por_min) * multiplicador;
  return Math.max(preco, config.tarifa_minima);
}
