import { supabase } from "@/integrations/supabase/client";

export interface TriboDoProfissional {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  signupSlug: string | null;
  activeModules: string[];
  papel: "owner" | "provider" | "manager";
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface PerfilPublicoProfissional {
  driverId: string;
  driverSlug: string;
  fullName: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  handle: string;
  tribos: TriboDoProfissional[];
}

/**
 * Busca o perfil público agregado de um profissional pelo seu @handle.
 * Lista todas as tribos visíveis (dono ou membro ativo).
 */
export async function buscarPerfilPublicoPorHandle(
  handle: string,
): Promise<PerfilPublicoProfissional | null> {
  const limpo = handle.replace(/^@/, "").trim().toLowerCase();
  if (!limpo) return null;

  const { data, error } = await supabase.rpc(
    "fn_get_professional_profile_by_handle" as any,
    { _handle: limpo },
  );
  if (error || !data) return null;

  const linhas = data as any[];
  if (!linhas.length) return null;

  const base = linhas[0];
  if (!base?.driver_id) return null;

  const tribos: TriboDoProfissional[] = linhas
    .filter((l) => l.tenant_id)
    .map((l) => ({
      tenantId: l.tenant_id,
      tenantSlug: l.tenant_slug,
      tenantName: l.tenant_name,
      signupSlug: l.signup_slug ?? null,
      activeModules: l.active_modules ?? ["mobility"],
      papel: (l.role ?? "provider") as TriboDoProfissional["papel"],
      categoryId: l.category_id ?? null,
      categoryName: l.category_name ?? null,
      categorySlug: l.category_slug ?? null,
    }));

  return {
    driverId: base.driver_id,
    driverSlug: base.driver_slug,
    fullName: base.full_name ?? null,
    avatarUrl: base.avatar_url ?? null,
    coverUrl: base.cover_url ?? null,
    bio: base.bio ?? null,
    handle: base.handle,
    tribos,
  };
}
