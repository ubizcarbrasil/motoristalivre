/**
 * Branding do tenant aplicado em comprovantes PDF.
 * Mantido independente do schema do banco para isolar o exportador.
 */
export interface BrandingPdf {
  logoUrl: string | null;
  corPrimariaHex: string;
  nomeEmpresa: string | null;
}

export const BRANDING_PDF_PADRAO: BrandingPdf = {
  logoUrl: null,
  corPrimariaHex: "#1db865",
  nomeEmpresa: null,
};
