import { supabase } from "@/integrations/supabase/client";
import type {
  ConviteEnviado,
  ProfissionalBusca,
  SolicitacaoRecebida,
  StatusConviteAdmin,
} from "../types/tipos_convites";

const EXPIRA_EM_DIAS = 7;

interface DriverRow {
  id: string;
  handle: string | null;
  avatar_url: string | null;
  tenant_id: string | null;
}

async function buscarNomesUsuarios(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", ids);
  return new Map(
    (data ?? []).map((u) => [u.id, u.full_name ?? u.email ?? "Profissional"]),
  );
}

export async function buscarProfissionaisPorTermo(
  tenantId: string,
  termo: string,
): Promise<ProfissionalBusca[]> {
  const limpo = termo.replace(/^@/, "").trim();
  if (limpo.length < 2) return [];

  // Busca por handle direto em drivers
  const { data: porHandle } = await supabase
    .from("drivers")
    .select("id, handle, avatar_url, tenant_id")
    .ilike("handle", `%${limpo}%`)
    .limit(20);

  // Busca também por nome em users (apenas usuários com perfil de driver)
  const { data: porNome } = await supabase
    .from("users")
    .select("id, full_name")
    .ilike("full_name", `%${limpo}%`)
    .limit(20);

  const idsPorNome = (porNome ?? []).map((u) => u.id);
  const { data: driversPorNome } = idsPorNome.length
    ? await supabase
        .from("drivers")
        .select("id, handle, avatar_url, tenant_id")
        .in("id", idsPorNome)
    : { data: [] as DriverRow[] };

  const mapa = new Map<string, DriverRow>();
  for (const d of [...(porHandle ?? []), ...(driversPorNome ?? [])]) {
    mapa.set(d.id, d);
  }
  if (mapa.size === 0) return [];

  const ids = [...mapa.keys()];
  const nomes = await buscarNomesUsuarios(ids);

  // Convites/solicitações pendentes nesse tenant
  const { data: pendentes } = await supabase
    .from("driver_group_invites")
    .select("driver_id, direction, status")
    .eq("tenant_id", tenantId)
    .eq("status", "pending")
    .in("driver_id", ids);

  const conviteEnviado = new Set(
    (pendentes ?? [])
      .filter((p) => p.direction === "invite_from_group")
      .map((p) => p.driver_id),
  );
  const solicitacao = new Set(
    (pendentes ?? [])
      .filter((p) => p.direction === "request_from_driver")
      .map((p) => p.driver_id),
  );

  return ids.map((id) => {
    const d = mapa.get(id)!;
    return {
      driver_id: id,
      nome: nomes.get(id) ?? "Profissional",
      handle: d.handle,
      avatar_url: d.avatar_url,
      tenant_id_atual: d.tenant_id,
      ja_e_membro: d.tenant_id === tenantId,
      ja_tem_convite_pendente: conviteEnviado.has(id),
      ja_tem_solicitacao_pendente: solicitacao.has(id),
    };
  });
}

export async function convidarProfissional(
  tenantId: string,
  driverId: string,
  message?: string,
) {
  const { data: auth } = await supabase.auth.getUser();
  const expiresAt = new Date(
    Date.now() + EXPIRA_EM_DIAS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { error } = await supabase.from("driver_group_invites").insert({
    tenant_id: tenantId,
    driver_id: driverId,
    direction: "invite_from_group",
    status: "pending",
    message: message ?? null,
    expires_at: expiresAt,
    created_by: auth.user?.id ?? null,
  });
  if (error) throw error;
}

export async function cancelarConvite(conviteId: string) {
  const { error } = await supabase
    .from("driver_group_invites")
    .update({ status: "rejected", responded_at: new Date().toISOString() })
    .eq("id", conviteId);
  if (error) throw error;
}

async function montarLista<T extends { driver_id: string }>(
  rows: T[],
): Promise<Map<string, { nome: string; handle: string | null; avatar_url: string | null }>> {
  const ids = [...new Set(rows.map((r) => r.driver_id))];
  if (ids.length === 0) return new Map();
  const [{ data: drivers }, nomes] = await Promise.all([
    supabase.from("drivers").select("id, handle, avatar_url").in("id", ids),
    buscarNomesUsuarios(ids),
  ]);
  const map = new Map<string, { nome: string; handle: string | null; avatar_url: string | null }>();
  for (const id of ids) {
    const d = (drivers ?? []).find((x) => x.id === id);
    map.set(id, {
      nome: nomes.get(id) ?? "Profissional",
      handle: d?.handle ?? null,
      avatar_url: d?.avatar_url ?? null,
    });
  }
  return map;
}

export async function listarConvitesEnviados(
  tenantId: string,
  status?: StatusConviteAdmin,
): Promise<ConviteEnviado[]> {
  let query = supabase
    .from("driver_group_invites")
    .select("id, driver_id, status, message, expires_at, created_at, responded_at")
    .eq("tenant_id", tenantId)
    .eq("direction", "invite_from_group")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];
  const meta = await montarLista(rows);
  return rows.map((r) => {
    const m = meta.get(r.driver_id)!;
    return {
      id: r.id,
      driver_id: r.driver_id,
      driver_nome: m?.nome ?? "Profissional",
      driver_handle: m?.handle ?? null,
      driver_avatar_url: m?.avatar_url ?? null,
      status: r.status as StatusConviteAdmin,
      message: r.message,
      expires_at: r.expires_at,
      created_at: r.created_at,
      responded_at: r.responded_at,
    };
  });
}

export async function listarSolicitacoesRecebidas(
  tenantId: string,
): Promise<SolicitacaoRecebida[]> {
  const { data, error } = await supabase
    .from("driver_group_invites")
    .select("id, driver_id, message, created_at")
    .eq("tenant_id", tenantId)
    .eq("direction", "request_from_driver")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const rows = data ?? [];
  const meta = await montarLista(rows);
  return rows.map((r) => {
    const m = meta.get(r.driver_id)!;
    return {
      id: r.id,
      driver_id: r.driver_id,
      driver_nome: m?.nome ?? "Profissional",
      driver_handle: m?.handle ?? null,
      driver_avatar_url: m?.avatar_url ?? null,
      message: r.message,
      created_at: r.created_at,
    };
  });
}

export async function responderSolicitacao(
  conviteId: string,
  resposta: "accepted" | "rejected",
) {
  const { error } = await supabase
    .from("driver_group_invites")
    .update({ status: resposta, responded_at: new Date().toISOString() })
    .eq("id", conviteId);
  if (error) throw error;
}
