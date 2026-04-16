import type { RespostaValidacao } from "../types/tipos_validacao_corrida";

/**
 * Chama a edge function pública (verify_jwt = false) que retorna
 * dados básicos da corrida + branding do tenant para validação via QR Code.
 *
 * Usa fetch direto para suportar query params na URL (?id=...),
 * já que supabase-js invoke não os passa adiante.
 */
export async function buscarValidacaoCorridaFetch(
  rideId: string,
): Promise<RespostaValidacao> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/validar-corrida?id=${encodeURIComponent(rideId)}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!resp.ok) {
    throw new Error(`Falha ao validar corrida (${resp.status})`);
  }

  return (await resp.json()) as RespostaValidacao;
}
