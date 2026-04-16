import { Car, DollarSign, Route } from "lucide-react";
import type { ResumoCorridas } from "../utils/utilitarios_perfil_passageiro";

interface ResumoHistoricoCorridasProps {
  resumo: ResumoCorridas;
}

function formatarValor(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

function CardResumo({
  icone,
  valor,
  label,
}: {
  icone: React.ReactNode;
  valor: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-2.5 text-center">
      <div className="flex justify-center mb-1">{icone}</div>
      <p className="text-xs font-bold text-foreground leading-tight">{valor}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export function ResumoHistoricoCorridas({ resumo }: ResumoHistoricoCorridasProps) {
  if (resumo.totalCorridas === 0) return null;

  const sufixoConcluidas =
    resumo.corridasConcluidas !== resumo.totalCorridas
      ? ` (${resumo.corridasConcluidas} concl.)`
      : "";

  return (
    <div className="grid grid-cols-3 gap-2">
      <CardResumo
        icone={<Car className="w-3.5 h-3.5 text-primary" />}
        valor={resumo.totalCorridas.toString()}
        label={`Corridas${sufixoConcluidas}`}
      />
      <CardResumo
        icone={<DollarSign className="w-3.5 h-3.5 text-primary" />}
        valor={formatarValor(resumo.totalGasto)}
        label="Total gasto"
      />
      <CardResumo
        icone={<Route className="w-3.5 h-3.5 text-primary" />}
        valor={formatarDistancia(resumo.totalDistancia)}
        label="Distância"
      />
    </div>
  );
}
