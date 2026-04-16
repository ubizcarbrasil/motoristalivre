import { supabase } from "@/integrations/supabase/client";
import { BRANDING_PDF_PADRAO, type BrandingPdf } from "../types/tipos_branding_pdf";

/**
 * Busca branding (logo + cor + nome) do tenant para uso em PDFs.
 * Retorna padrão da plataforma caso falhe ou não exista.
 */
export async function buscarBrandingPdf(tenantId: string): Promise<BrandingPdf> {
  try {
    const [brandingRes, tenantRes] = await Promise.all([
      supabase
        .from("tenant_branding")
        .select("logo_url, primary_color")
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase.from("tenants").select("name").eq("id", tenantId).maybeSingle(),
    ]);

    return {
      logoUrl: brandingRes.data?.logo_url ?? null,
      corPrimariaHex: brandingRes.data?.primary_color ?? BRANDING_PDF_PADRAO.corPrimariaHex,
      nomeEmpresa: tenantRes.data?.name ?? null,
    };
  } catch {
    return BRANDING_PDF_PADRAO;
  }
}
