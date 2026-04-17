import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { EntradaLog } from "../types/tipos_simulador";
import { cn } from "@/lib/utils";

interface Props {
  logs: EntradaLog[];
  onLimpar: () => void;
}

const CORES = {
  info: "text-muted-foreground",
  sucesso: "text-primary",
  erro: "text-destructive",
};

export function LogSimulacao({ logs, onLimpar }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Log da simulação</h3>
        <Button variant="ghost" size="sm" onClick={onLimpar} disabled={!logs.length} className="h-8 gap-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          Limpar
        </Button>
      </div>
      <div className="space-y-1.5 max-h-80 overflow-auto font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-muted-foreground italic">Nenhum evento ainda.</p>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="flex gap-2">
              <span className="text-muted-foreground shrink-0">{l.momento}</span>
              <span className={cn("flex-1", CORES[l.nivel])}>{l.mensagem}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
