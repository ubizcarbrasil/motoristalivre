import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConviteGrupo } from "../types/tipos_configuracoes";

interface CardConviteGrupoProps {
  convite: ConviteGrupo;
  onResponder: (id: string, resposta: "accepted" | "rejected") => void | Promise<void>;
}

export function CardConviteGrupo({ convite, onResponder }: CardConviteGrupoProps) {
  const isConvite = convite.direction === "invite_from_group";

  return (
    <div className="rounded-xl bg-card border border-primary/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{convite.tenant_nome}</p>
        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {isConvite ? "Convite" : "Solicitação enviada"}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground font-mono">@{convite.tenant_slug}</p>
      {convite.message && (
        <p className="text-xs text-muted-foreground italic">"{convite.message}"</p>
      )}
      {convite.expires_at && (
        <p className="text-[10px] text-muted-foreground">
          Expira em {new Date(convite.expires_at).toLocaleDateString("pt-BR")}
        </p>
      )}

      {isConvite && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 gap-1"
            onClick={() => onResponder(convite.id, "rejected")}
          >
            <X className="w-3.5 h-3.5" />
            Recusar
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 gap-1"
            onClick={() => onResponder(convite.id, "accepted")}
          >
            <Check className="w-3.5 h-3.5" />
            Aceitar
          </Button>
        </div>
      )}
    </div>
  );
}
