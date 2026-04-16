import { Star, BadgeCheck } from "lucide-react";
import type { MotoristaCorrida } from "../types/tipos_passageiro";

interface CardMotoristaAceitoProps {
  motorista: MotoristaCorrida;
}

export function CardMotoristaAceito({ motorista }: CardMotoristaAceitoProps) {
  const iniciais = motorista.nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-start gap-3">
      <div className="relative">
        {motorista.avatar_url ? (
          <img
            src={motorista.avatar_url}
            alt={motorista.nome}
            className="w-16 h-16 rounded-full object-cover bg-secondary"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-base font-semibold text-foreground">
            {iniciais}
          </div>
        )}
        {motorista.is_online && (
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary border-2 border-background animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-base font-semibold text-foreground truncate">{motorista.nome}</p>
          <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground">@{motorista.handle}</p>

        {motorista.grupos.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {motorista.grupos.map((g) => (
              <a
                key={g.handle}
                href={`/${g.handle}`}
                className="text-[11px] text-primary hover:underline"
              >
                @{g.handle}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="font-semibold text-foreground">
              {motorista.nota_media > 0 ? motorista.nota_media.toFixed(1) : "—"}
            </span>
          </span>
          <span>{motorista.total_corridas} corridas</span>
          {motorista.is_online && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Online
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
