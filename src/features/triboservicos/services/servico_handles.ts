import { supabase } from "@/integrations/supabase/client";

export interface ResolucaoHandle {
  driver_id: string;
  driver_slug: string;
  tenant_slug: string;
  tenant_id: string;
}

/**
 * Resolve um handle (`@joao`) → slugs do tenant + driver para montar URL canônica.
 */
export async function resolverHandle(
  handle: string,
): Promise<ResolucaoHandle | null> {
  const limpo = handle.replace(/^@/, "").trim().toLowerCase();
  if (!limpo) return null;

  const { data, error } = await supabase.rpc("resolve_handle" as any, {
    _handle: limpo,
  });
  if (error) return null;
  const linha = (data as any[])?.[0];
  if (!linha) return null;
  return {
    driver_id: linha.driver_id,
    driver_slug: linha.driver_slug,
    tenant_slug: linha.tenant_slug,
    tenant_id: linha.tenant_id,
  };
}

/**
 * Verifica se um handle está disponível (não usado por outro driver).
 * Aceita opcionalmente o id do driver atual para permitir manter o próprio.
 */
export async function verificarDisponibilidadeHandle(
  handle: string,
  driverIdAtual?: string,
): Promise<boolean> {
  const limpo = handle.replace(/^@/, "").trim().toLowerCase();
  if (!limpo) return false;

  const { data } = await supabase
    .from("drivers")
    .select("id")
    .eq("handle", limpo)
    .maybeSingle();

  if (!data) return true;
  return data.id === driverIdAtual;
}

/**
 * Atualiza o handle do driver autenticado.
 */
export async function atualizarHandle(
  driverId: string,
  novoHandle: string,
): Promise<{ ok: boolean; erro?: string }> {
  const limpo = novoHandle.replace(/^@/, "").trim().toLowerCase();
  if (!validarFormatoHandle(limpo)) {
    return { ok: false, erro: "Formato inválido" };
  }
  const disponivel = await verificarDisponibilidadeHandle(limpo, driverId);
  if (!disponivel) {
    return { ok: false, erro: "Handle já em uso" };
  }
  const { error } = await supabase
    .from("drivers")
    .update({ handle: limpo })
    .eq("id", driverId);
  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}

/**
 * Busca o handle atual de um driver.
 */
export async function buscarHandle(driverId: string): Promise<string | null> {
  const { data } = await supabase
    .from("drivers")
    .select("handle")
    .eq("id", driverId)
    .maybeSingle();
  return (data as any)?.handle ?? null;
}

const REGEX_HANDLE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export function validarFormatoHandle(handle: string): boolean {
  return REGEX_HANDLE.test(handle.replace(/^@/, "").trim().toLowerCase());
}

/**
 * Constrói o link público preferindo handle quando disponível.
 */
export function construirLinkPerfilPreferindoHandle(args: {
  handle: string | null;
  tenant_slug: string;
  driver_slug: string;
}): string {
  if (args.handle) return `/@${args.handle}`;
  return `/s/${args.tenant_slug}/${args.driver_slug}`;
}
