import { supabase } from "@/integrations/supabase/client";
import { BRANDING_PDF_PADRAO, type BrandingPdf } from "../types/tipos_branding_pdf";

/**
 * Cache em memória do branding por tenant.
 * - TTL configurável (padrão: 5 minutos) para garantir atualizações eventuais.
 * - Deduplica requisições paralelas (in-flight) para o mesmo tenant.
 */
const TTL_MS = 5 * 60 * 1000;

interface EntradaCache {
  dados: BrandingPdf;
  expiraEm: number;
}

const cacheBranding = new Map<string, EntradaCache>();
const buscasEmAndamento = new Map<string, Promise<BrandingPdf>>();

async function buscarDoSupabase(tenantId: string): Promise<BrandingPdf> {
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

/**
 * Busca branding (logo + cor + nome) do tenant para uso em PDFs.
 * Usa cache em memória com TTL para evitar requisições repetidas ao Supabase.
 * Retorna padrão da plataforma caso falhe ou não exista.
 */
export async function buscarBrandingPdf(tenantId: string): Promise<BrandingPdf> {
  const agora = Date.now();
  const entrada = cacheBranding.get(tenantId);

  if (entrada && entrada.expiraEm > agora) {
    return entrada.dados;
  }

  const emAndamento = buscasEmAndamento.get(tenantId);
  if (emAndamento) {
    return emAndamento;
  }

  const promessa = buscarDoSupabase(tenantId)
    .then((dados) => {
      cacheBranding.set(tenantId, { dados, expiraEm: Date.now() + TTL_MS });
      return dados;
    })
    .finally(() => {
      buscasEmAndamento.delete(tenantId);
    });

  buscasEmAndamento.set(tenantId, promessa);
  return promessa;
}

/**
 * Invalida o cache de branding de um tenant específico ou de todos.
 * Útil após o tenant atualizar logo/cor no painel de identidade.
 */
export function invalidarCacheBranding(tenantId?: string): void {
  if (tenantId) {
    cacheBranding.delete(tenantId);
  } else {
    cacheBranding.clear();
  }
}
