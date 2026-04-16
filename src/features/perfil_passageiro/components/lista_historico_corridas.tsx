import { Car, MapPin } from "lucide-react";
import type { CorridaHistorico } from "../types/tipos_perfil_passageiro";
import { STATUS_CORRIDA_LABELS } from "../types/tipos_perfil_passageiro";

interface ListaHistoricoCorridasProps {
  corridas: CorridaHistorico[];
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ItemCorrida({ corrida }: { corrida: CorridaHistorico }) {
  const status = STATUS_CORRIDA_LABELS[corrida.status];
  const inicial = corrida.motorista_nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="rounded-xl bg-card border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
          {corrida.motorista_avatar ? (
            <img
              src={corrida.motorista_avatar}
              alt={corrida.motorista_nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-foreground">{inicial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground truncate">
            {corrida.motorista_nome}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatarData(corrida.created_at)}
          </p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${status.cor}`}
        >
          {status.label}
        </span>
      </div>

      {(corrida.origin_address || corrida.dest_address) && (
        <div className="space-y-1 pl-1">
          {corrida.origin_address && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground truncate">
                {corrida.origin_address}
              </p>
            </div>
          )}
          {corrida.dest_address && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground truncate">
                {corrida.dest_address}
              </p>
            </div>
          )}
        </div>
      )}

      {corrida.price_paid !== null && (
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-[10px] text-muted-foreground">Valor</span>
          <span className="text-sm font-semibold text-foreground">
            R$ {corrida.price_paid.toFixed(2).replace(".", ",")}
          </span>
        </div>
      )}
    </div>
  );
}

export function ListaHistoricoCorridas({ corridas }: ListaHistoricoCorridasProps) {
  if (corridas.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center gap-2 text-center">
        <Car className="w-6 h-6 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Nenhuma corrida registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {corridas.map((c) => (
        <ItemCorrida key={c.id} corrida={c} />
      ))}
    </div>
  );
}
