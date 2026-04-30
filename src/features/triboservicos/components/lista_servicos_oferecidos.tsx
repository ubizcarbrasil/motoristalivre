import { Clock, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";

interface Props {
  servicos: TipoServico[];
  onSelecionar: (servicoId: string) => void;
}

export function ListaServicosOferecidos({ servicos, onSelecionar }: Props) {
  if (servicos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Este profissional ainda não publicou serviços.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {servicos.map((servico) => (
        <Card
          key={servico.id}
          onClick={() => onSelecionar(servico.id)}
          className="p-4 cursor-pointer hover:bg-accent/40 transition-colors border-border/60"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-foreground">{servico.name}</h3>
                {servico.is_immediate && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Zap className="w-3 h-3" />
                    Imediato
                  </Badge>
                )}
              </div>
              {servico.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {servico.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {servico.duration_minutes} min
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-semibold text-primary">
                {Number(servico.price).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              {(() => {
                const modo = (servico as unknown as { pricing_mode?: string }).pricing_mode;
                if (!modo || modo === "fixed") return null;
                return (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {modo === "per_hour" && "por hora"}
                    {modo === "per_day" && "por diária"}
                  </p>
                );
              })()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
