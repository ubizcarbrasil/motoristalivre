import type { DadosMotorista } from "../types/tipos_passageiro";
import { User } from "lucide-react";

interface StripMotoristaProps {
  motorista: DadosMotorista;
}

export function StripMotorista({ motorista }: StripMotoristaProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
        {motorista.avatar_url ? (
          <img src={motorista.avatar_url} alt={motorista.nome} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{motorista.nome}</p>
        <p className="text-xs text-muted-foreground truncate">{motorista.grupo_nome}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {motorista.nota !== null && (
          <span className="text-xs text-muted-foreground">{motorista.nota.toFixed(1)}</span>
        )}
        <div className={`w-2 h-2 rounded-full ${motorista.is_online ? "bg-primary" : "bg-muted-foreground"}`} />
      </div>
    </div>
  );
}
