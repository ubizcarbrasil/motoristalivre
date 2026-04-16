import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DistribuicaoNotas as DistTipo } from "../types/tipos_perfil_motorista";

interface Props {
  distribuicao: DistTipo[];
  notaMedia: number;
  totalAvaliacoes: number;
}

export function DistribuicaoNotas({ distribuicao, notaMedia, totalAvaliacoes }: Props) {
  return (
    <div className="px-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Avaliacoes</h2>
      <div className="flex gap-6">
        <div className="flex flex-col items-center justify-center min-w-[64px]">
          <span className="text-4xl font-bold text-foreground">
            {notaMedia > 0 ? notaMedia.toFixed(1) : "--"}
          </span>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${s <= Math.round(notaMedia) ? "text-primary fill-primary" : "text-muted-foreground"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground mt-1">{totalAvaliacoes}</span>
        </div>

        <div className="flex-1 space-y-1.5">
          {distribuicao.map((d) => (
            <div key={d.estrela} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3 text-right">{d.estrela}</span>
              <Progress value={d.percentual} className="h-2 flex-1 bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
