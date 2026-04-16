import { Star } from "lucide-react";
import type { AvaliacaoMotorista } from "../types/tipos_passageiro";

interface AvaliacoesMotoristaProps {
  avaliacoes: AvaliacaoMotorista[];
}

export function AvaliacoesMotorista({ avaliacoes }: AvaliacoesMotoristaProps) {
  if (avaliacoes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        Sem avaliações ainda
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Últimas avaliações
      </p>
      {avaliacoes.map((a) => (
        <div key={a.id} className="rounded-xl bg-secondary px-3 py-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < a.rating ? "fill-primary text-primary" : "text-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          {a.comment && (
            <p className="text-xs text-foreground mt-1 line-clamp-2">{a.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
