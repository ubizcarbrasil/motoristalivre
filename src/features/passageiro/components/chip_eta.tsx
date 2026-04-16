import { formatarDistancia, formatarDuracao } from "../utils/utilitarios_passageiro";
import type { DadosRota } from "../types/tipos_passageiro";

interface ChipEtaProps {
  rota: DadosRota;
}

export function ChipEta({ rota }: ChipEtaProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
      <span className="text-xs font-medium text-foreground">{formatarDistancia(rota.distancia_km)}</span>
      <div className="w-px h-3 bg-border" />
      <span className="text-xs font-medium text-foreground">{formatarDuracao(rota.duracao_min)}</span>
    </div>
  );
}
