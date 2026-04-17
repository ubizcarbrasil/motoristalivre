import type { DadosSimulacao } from "../types/tipos_simulador";

export const VALORES_PADRAO_SIMULACAO: Omit<DadosSimulacao, "tenantId" | "motoristaId"> = {
  origem: "Praça Central, Centro",
  destino: "Aeroporto Internacional",
  valor: 25,
  distanciaKm: 8.5,
  duracaoMin: 18,
};

// Coordenadas fictícias plausíveis (Brasil — centro)
export const COORDS_FAKE = {
  origem: { lat: -23.55052, lng: -46.633308 },
  destino: { lat: -23.435556, lng: -46.473056 },
};

// Passenger fantasma idempotente por tenant — derivado pra evitar colisão real
export function gerarIdPassageiroFantasma(tenantId: string): string {
  // Mantém um UUID válido e estável usando os primeiros 8 chars do tenant
  const prefixo = tenantId.replace(/-/g, "").slice(0, 8);
  return `00000000-0000-4000-8000-${prefixo}0000`;
}
