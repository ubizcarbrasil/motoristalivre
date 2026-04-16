import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { ETAPAS_CORRIDA } from "../constants/constantes_passageiro";
import type { StatusCorrida } from "../types/tipos_passageiro";

interface CronometroEtapasProps {
  status: StatusCorrida;
  acceptedAt: string;
  estimatedMin: number;
}

type EtapaId = (typeof ETAPAS_CORRIDA)[number]["id"];

function indiceEtapa(status: StatusCorrida): number {
  switch (status) {
    case "accepted": return 1; // "A caminho" ativo
    case "in_progress": return 3; // "Em viagem" ativo
    case "completed": return 3;
    default: return 0;
  }
}

function formatarMMSS(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function CronometroEtapas({ status, acceptedAt, estimatedMin }: CronometroEtapasProps) {
  const totalSeg = estimatedMin * 60;
  const inicio = useMemo(() => new Date(acceptedAt).getTime(), [acceptedAt]);
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const decorridos = Math.floor((agora - inicio) / 1000);
  const restantes = Math.max(0, totalSeg - decorridos);
  const ativaIdx = indiceEtapa(status);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Chega em</p>
        <p className="text-3xl font-bold text-foreground tabular-nums">
          {status === "in_progress" ? "Em viagem" : formatarMMSS(restantes)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-1">
        {ETAPAS_CORRIDA.map((etapa, i) => {
          const concluida = i < ativaIdx;
          const ativa = i === ativaIdx;
          return (
            <div key={etapa.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                  concluida
                    ? "bg-primary text-primary-foreground"
                    : ativa
                    ? "bg-primary/20 text-primary border border-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {concluida ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] text-center ${
                  ativa ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {etapa.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
