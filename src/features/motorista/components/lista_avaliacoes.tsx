import { Star, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AvaliacaoPublica } from "../types/tipos_perfil_motorista";

interface Props {
  avaliacoes: AvaliacaoPublica[];
}

function tempoRelativo(data: string): string {
  const diff = Date.now() - new Date(data).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const m = Math.floor(d / 30);
  return `${m} mes${m > 1 ? "es" : ""}`;
}

export function ListaAvaliacoes({ avaliacoes }: Props) {
  if (avaliacoes.length === 0) return null;

  return (
    <div className="px-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">Avaliacoes recentes</h2>
      <div className="space-y-3">
        {avaliacoes.map((av) => (
          <div key={av.id} className="flex gap-3 rounded-xl bg-card border border-border p-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-muted-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${s <= av.rating ? "text-primary fill-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {tempoRelativo(av.created_at)}
                </span>
              </div>
              {av.comment && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{av.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
