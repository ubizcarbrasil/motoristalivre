import { supabase } from "@/integrations/supabase/client";

export interface TriboResolvida {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  serviceCategoryId: string | null;
  serviceCategorySlug: string | null;
  serviceCategoryName: string | null;
  ownerUserId: string;
}

/**
 * Resolve o signup_slug público de uma tribo para exibir na tela de cadastro.
 * Pode ser chamado por usuários anônimos.
 */
export async function resolverTriboPorSignupSlug(signupSlug: string): Promise<TriboResolvida | null> {
  const { data, error } = await supabase.rpc("fn_resolve_tribe_by_signup_slug" as any, {
    _signup_slug: signupSlug,
  });

  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;

  const linha = Array.isArray(data) ? data[0] : data;
  if (!linha) return null;

  return {
    tenantId: linha.tenant_id,
    tenantName: linha.tenant_name,
    tenantSlug: linha.tenant_slug,
    serviceCategoryId: linha.service_category_id ?? null,
    serviceCategorySlug: linha.service_category_slug ?? null,
    serviceCategoryName: linha.service_category_name ?? null,
    ownerUserId: linha.owner_user_id,
  };
}

/**
 * Vincula o usuário autenticado à tribo via signup_slug.
 * Idempotente — reativa vínculo se já existir.
 */
export async function entrarNaTriboPorSignupSlug(
  signupSlug: string,
  comissaoPercent = 0,
): Promise<string> {
  const { data, error } = await supabase.rpc("fn_join_tribe_by_signup_slug" as any, {
    _signup_slug: signupSlug,
    _commission_percent: comissaoPercent,
  });
  if (error || !data) {
    throw error || new Error("Não foi possível entrar na tribo");
  }
  return data as string;
}
