import { supabase } from "@/integrations/supabase/client";
import { slugValido } from "@/compartilhados/constants/constantes_categorias_servico";

/**
 * Salvamento parcial do onboarding profissional. Diferente de
 * `salvarOnboardingProfissional`, aqui aceitamos campos opcionais e gravamos
 * apenas o que está preenchido — usado para auto-save em tempo real.
 */
export interface RascunhoOnboarding {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  cover_url?: string;
  professional_type?: "driver" | "service_provider" | "both" | "";
  service_categories?: string[];
  cidade?: string;
}

function valorPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (Array.isArray(valor)) return valor.length > 0;
  return true;
}

export async function salvarRascunhoOnboarding(
  driverId: string,
  tenantId: string,
  dados: RascunhoOnboarding,
): Promise<void> {
  // ---------- users ----------
  const patchUsers: Record<string, unknown> = {};
  if (valorPreenchido(dados.full_name)) patchUsers.full_name = dados.full_name;
  if (valorPreenchido(dados.phone)) patchUsers.phone = dados.phone;
  if (valorPreenchido(dados.avatar_url)) patchUsers.avatar_url = dados.avatar_url;

  if (Object.keys(patchUsers).length > 0) {
    const { error } = await supabase
      .from("users")
      .update(patchUsers as never)
      .eq("id", driverId);
    if (error) throw error;
  }

  // ---------- drivers ----------
  const patchDrivers: Record<string, unknown> = {};
  if (valorPreenchido(dados.bio)) patchDrivers.bio = dados.bio;
  if (valorPreenchido(dados.cover_url)) patchDrivers.cover_url = dados.cover_url;
  if (valorPreenchido(dados.professional_type)) {
    patchDrivers.professional_type = dados.professional_type;
  }
  if (Array.isArray(dados.service_categories) && dados.service_categories.length > 0) {
    const categoriasSaneadas = dados.service_categories.filter((slug) => slugValido(slug));
    if (categoriasSaneadas.length > 0) {
      patchDrivers.service_categories = categoriasSaneadas;
    }
  }

  if (Object.keys(patchDrivers).length > 0) {
    const { error } = await supabase
      .from("drivers")
      .update(patchDrivers as never)
      .eq("id", driverId);
    if (error) throw error;
  }

  // ---------- tenant_branding (cidade) ----------
  if (valorPreenchido(dados.cidade)) {
    const { data: existente } = await supabase
      .from("tenant_branding")
      .select("tenant_id")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existente) {
      const { error } = await supabase
        .from("tenant_branding")
        .update({ city: dados.cidade })
        .eq("tenant_id", tenantId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("tenant_branding")
        .insert({ tenant_id: tenantId, city: dados.cidade });
      if (error) throw error;
    }
  }
}
