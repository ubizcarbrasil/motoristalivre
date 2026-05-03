import { supabase } from "@/integrations/supabase/client";

/**
 * Sai de uma tribo onde o profissional é apenas membro.
 * Não é permitido para o dono da tribo.
 */
export async function sairDaTribo(tenantId: string): Promise<void> {
  const { error } = await supabase.rpc("fn_leave_tribe" as any, {
    _tenant_id: tenantId,
  });
  if (error) throw error;
}

/**
 * Monta o link de recrutamento público da tribo.
 */
export function montarLinkRecrutamento(signupSlug: string): string {
  return `${window.location.origin}/s/cadastro/tribo/${signupSlug}`;
}
