import { MapPin, Link } from "lucide-react";
import type { CorridaRecente } from "../types/tipos_painel";

interface ListaCorridasProps {
  corridas: CorridaRecente[];
}

export function ListaCorridas({ corridas }: ListaCorridasProps) {
  if (corridas.length === 0) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma corrida recente</p>
      </div>
    );
  }

  return (
    <div className="px-5 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Últimas corridas
      </p>
      {corridas.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{c.destino_endereco}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="w-3 h-3" />
              <span>{c.origem_nome}</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-foreground shrink-0">
            R${c.valor.toFixed(2).replace(".", ",")}
          </span>
        </div>
      ))}
    </div>
  );
}
