/**
 * Normaliza um texto para kebab-case ASCII sem acentos.
 * Ex.: "Banho e Tosa" -> "banho-e-tosa"
 */
export function normalizarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
