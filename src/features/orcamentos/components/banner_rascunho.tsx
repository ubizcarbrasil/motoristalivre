import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  atualizadoEm: number;
  onContinuar: () => void;
  onDescartar: () => void;
}

function formatarTempo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function BannerRascunho({ atualizadoEm, onContinuar, onDescartar }: Props) {
  return (
    <div className="rounded-2xl bg-card border border-primary/40 p-4 mb-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Você tem um pedido em andamento
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Salvo automaticamente {formatarTempo(atualizadoEm)}
        </p>
        <div className="flex gap-2 mt-3">
          <Button onClick={onContinuar} size="sm" className="h-9">
            Continuar
          </Button>
          <Button
            onClick={onDescartar}
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Descartar
          </Button>
        </div>
      </div>
    </div>
  );
}
