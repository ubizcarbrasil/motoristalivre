import { supabase } from "@/integrations/supabase/client";
import type { DadosOnboarding } from "../schemas/schema_onboarding_profissional";

const TAMANHO_MAX_MB = 5;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

export function validarArquivoImagem(arquivo: File) {
  if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
    throw new Error("Use uma imagem JPG, PNG ou WEBP");
  }
  const tamanhoMb = arquivo.size / (1024 * 1024);
  if (tamanhoMb > TAMANHO_MAX_MB) {
    throw new Error(`Imagem maior que ${TAMANHO_MAX_MB}MB`);
  }
}

export async function uploadImagemBranding(
  driverId: string,
  arquivo: File,
  tipo: "avatar" | "cover",
): Promise<string> {
  validarArquivoImagem(arquivo);
  const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${driverId}/${tipo}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("branding").upload(path, arquivo, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}

export async function salvarOnboardingProfissional(
  driverId: string,
  tenantId: string,
  dados: DadosOnboarding,
): Promise<void> {
  // Atualiza users (nome, telefone, avatar)
  const { error: erroUsers } = await supabase
    .from("users")
    .update({
      full_name: dados.full_name,
      phone: dados.phone,
      avatar_url: dados.avatar_url,
    })
    .eq("id", driverId);
  if (erroUsers) throw erroUsers;

  // Atualiza drivers (bio, capa, tipo profissional, categorias)
  const { error: erroDrivers } = await supabase
    .from("drivers")
    .update({
      bio: dados.bio,
      cover_url: dados.cover_url,
      professional_type: dados.professional_type,
      service_categories: dados.service_categories,
    } as never)
    .eq("id", driverId);
  if (erroDrivers) throw erroDrivers;

  // Atualiza tenant_branding (cidade)
  const { data: brandingExistente } = await supabase
    .from("tenant_branding")
    .select("tenant_id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (brandingExistente) {
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
