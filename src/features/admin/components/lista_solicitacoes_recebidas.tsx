import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import type { SolicitacaoRecebida } from "../types/tipos_convites";

interface Props {
  solicitacoes: SolicitacaoRecebida[];
  onResponder: (id: string, resposta: "accepted" | "rejected") => Promise<void>;
}

export function ListaSolicitacoesRecebidas({ solicitacoes, onResponder }: Props) {
  async function handle(id: string, resposta: "accepted" | "rejected") {
    try {
      await onResponder(id, resposta);
      toast.success(resposta === "accepted" ? "Solicitação aceita" : "Solicitação recusada");
    } catch (err) {
      toast.error("Erro ao responder");
      console.error(err);
    }
  }

  if (solicitacoes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Nenhuma solicitação pendente
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {solicitacoes.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border border-primary/30 bg-card p-3 space-y-2"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {s.driver_avatar_url && <AvatarImage src={s.driver_avatar_url} />}
              <AvatarFallback>{s.driver_nome.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{s.driver_nome}</p>
              {s.driver_handle && (
                <p className="text-[11px] font-mono text-muted-foreground truncate">
                  @{s.driver_handle}
                </p>
              )}
            </div>
          </div>
          {s.message && (
            <p className="text-xs italic text-muted-foreground">"{s.message}"</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => handle(s.id, "rejected")}
            >
              <X className="h-3.5 w-3.5" />
              Recusar
            </Button>
            <Button size="sm" className="flex-1 gap-1" onClick={() => handle(s.id, "accepted")}>
              <Check className="h-3.5 w-3.5" />
              Aceitar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
