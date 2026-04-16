import type { CorridaHistorico, StatusCorrida } from "../types/tipos_perfil_passageiro";
import type { FiltroPeriodo, FiltroStatus } from "../components/filtros_historico_corridas";

const STATUS_CONCLUIDAS: StatusCorrida[] = ["completed"];
const STATUS_CANCELADAS: StatusCorrida[] = ["cancelled", "expired"];

const DIAS_POR_PERIODO: Record<FiltroPeriodo, number | null> = {
  todos: null,
  "7dias": 7,
  "30dias": 30,
  "90dias": 90,
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filtrarCorridas(
  corridas: CorridaHistorico[],
  status: FiltroStatus,
  periodo: FiltroPeriodo,
  busca: string = ""
): CorridaHistorico[] {
  const dias = DIAS_POR_PERIODO[periodo];
  const limite = dias !== null ? Date.now() - dias * 24 * 60 * 60 * 1000 : null;
  const termo = normalizar(busca.trim());

  return corridas.filter((c) => {
    if (status === "concluidas" && !STATUS_CONCLUIDAS.includes(c.status)) return false;
    if (status === "canceladas" && !STATUS_CANCELADAS.includes(c.status)) return false;
    if (limite !== null && new Date(c.created_at).getTime() < limite) return false;
    if (termo) {
      const alvo = normalizar(
        `${c.motorista_nome} ${c.origin_address ?? ""} ${c.dest_address ?? ""}`
      );
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
}
