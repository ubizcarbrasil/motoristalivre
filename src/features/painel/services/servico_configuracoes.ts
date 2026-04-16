import { supabase } from "@/integrations/supabase/client";
import type {
  ConfigPrecoMotorista,
  ConfigRegrasDispatch,
  ConviteGrupo,
  GrupoMotorista,
  ResultadoBuscaGrupo,
  ModoDispatch,
} from "../types/tipos_configuracoes";

// ============ Preço ============

export async function buscarConfigPreco(
  driverId: string,
  tenantId: string,
): Promise<ConfigPrecoMotorista> {
  const [{ data: driver }, { data: settings }] = await Promise.all([
    supabase
      .from("drivers")
      .select("custom_base_fare, custom_price_per_km, custom_price_per_min, cashback_pct")
      .eq("id", driverId)
      .maybeSingle(),
    supabase
      .from("tenant_settings")
      .select("base_fare, price_per_km, price_per_min, allow_driver_pricing")
      .eq("tenant_id", tenantId)
      .maybeSingle(),
  ]);

  return {
    base_fare: driver?.custom_base_fare ?? settings?.base_fare ?? 5,
    price_per_km: driver?.custom_price_per_km ?? settings?.price_per_km ?? 2,
    price_per_min: driver?.custom_price_per_min ?? settings?.price_per_min ?? 0.5,
    cashback_pct: driver?.cashback_pct ?? 0,
    permitido: settings?.allow_driver_pricing ?? false,
  };
}

export async function salvarConfigPreco(
  driverId: string,
  config: Pick<ConfigPrecoMotorista, "base_fare" | "price_per_km" | "price_per_min" | "cashback_pct">,
) {
  const { error } = await supabase
    .from("drivers")
    .update({
      custom_base_fare: config.base_fare,
      custom_price_per_km: config.price_per_km,
      custom_price_per_min: config.price_per_min,
      cashback_pct: config.cashback_pct,
    })
    .eq("id", driverId);
  if (error) throw error;
}

// ============ Regras de despacho ============

export async function buscarRegrasDispatch(
  driverId: string,
  tenantId: string,
  ehAdmin: boolean,
): Promise<ConfigRegrasDispatch> {
  const [{ data: driver }, { data: settings }] = await Promise.all([
    supabase.from("drivers").select("dispatch_mode").eq("id", driverId).maybeSingle(),
    supabase
      .from("tenant_settings")
      .select("dispatch_mode, dispatch_timeout_sec")
      .eq("tenant_id", tenantId)
      .maybeSingle(),
  ]);

  return {
    modo: (driver?.dispatch_mode ?? settings?.dispatch_mode ?? "auto") as ModoDispatch,
    timeout_sec: settings?.dispatch_timeout_sec ?? 28,
    pode_editar: ehAdmin,
  };
}

export async function salvarModoDispatchMotorista(driverId: string, modo: ModoDispatch) {
  const { error } = await supabase
    .from("drivers")
    .update({ dispatch_mode: modo })
    .eq("id", driverId);
  if (error) throw error;
}

export async function salvarTimeoutDispatchTenant(tenantId: string, timeoutSec: number) {
  const { error } = await supabase
    .from("tenant_settings")
    .update({ dispatch_timeout_sec: timeoutSec })
    .eq("tenant_id", tenantId);
  if (error) throw error;
}

// ============ Grupos & convites ============

function inicioDoMes() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function buscarMeusGrupos(driverId: string): Promise<GrupoMotorista[]> {
  // Hoje, um motorista pertence a UM tenant via users.tenant_id
  const { data: user } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", driverId)
    .maybeSingle();

  if (!user?.tenant_id) return [];

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("id", user.tenant_id)
    .maybeSingle();

  if (!tenant) return [];

  const { count: corridas } = await supabase
    .from("rides")
    .select("id", { count: "exact", head: true })
    .eq("driver_id", driverId)
    .eq("tenant_id", tenant.id)
    .gte("created_at", inicioDoMes());

  return [
    {
      tenant_id: tenant.id,
      tenant_nome: tenant.name,
      tenant_slug: tenant.slug,
      papel: (user.role as GrupoMotorista["papel"]) ?? "driver",
      corridas_mes: corridas ?? 0,
    },
  ];
}

export async function buscarConvitesPendentes(driverId: string): Promise<ConviteGrupo[]> {
  const { data } = await supabase
    .from("driver_group_invites")
    .select("id, tenant_id, direction, status, message, expires_at, created_at")
    .eq("driver_id", driverId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const tenantIds = [...new Set(data.map((i) => i.tenant_id))];
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .in("id", tenantIds);

  const tenantMap = new Map(tenants?.map((t) => [t.id, t]) ?? []);

  return data.map((i) => {
    const t = tenantMap.get(i.tenant_id);
    return {
      id: i.id,
      tenant_id: i.tenant_id,
      tenant_nome: t?.name ?? "Grupo",
      tenant_slug: t?.slug ?? "",
      direction: i.direction,
      status: i.status,
      message: i.message,
      expires_at: i.expires_at,
      created_at: i.created_at,
    };
  });
}

export async function responderConvite(
  conviteId: string,
  resposta: "accepted" | "rejected",
) {
  const { error } = await supabase
    .from("driver_group_invites")
    .update({ status: resposta, responded_at: new Date().toISOString() })
    .eq("id", conviteId);
  if (error) throw error;
}

export async function buscarGruposPorHandle(
  termo: string,
  driverId: string,
): Promise<ResultadoBuscaGrupo[]> {
  const limpo = termo.replace(/^@/, "").trim();
  if (limpo.length < 2) return [];

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .ilike("slug", `%${limpo}%`)
    .limit(10);

  if (!tenants || tenants.length === 0) return [];

  const { data: user } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", driverId)
    .maybeSingle();

  const { data: solicitacoes } = await supabase
    .from("driver_group_invites")
    .select("tenant_id")
    .eq("driver_id", driverId)
    .eq("status", "pending")
    .in(
      "tenant_id",
      tenants.map((t) => t.id),
    );

  const pendentes = new Set(solicitacoes?.map((s) => s.tenant_id) ?? []);

  return tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    ja_e_membro: t.id === user?.tenant_id,
    tem_solicitacao_pendente: pendentes.has(t.id),
  }));
}

export async function solicitarEntradaGrupo(driverId: string, tenantId: string) {
  const { error } = await supabase.from("driver_group_invites").insert({
    driver_id: driverId,
    tenant_id: tenantId,
    direction: "request_from_driver",
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
}
