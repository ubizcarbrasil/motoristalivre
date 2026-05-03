import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ConviteEnviado, StatusConviteAdmin } from "../types/tipos_convites";

interface Props {
  convites: ConviteEnviado[];
  filtro: StatusConviteAdmin | "todos";
  onMudarFiltro: (f: StatusConviteAdmin | "todos") => void;
  onCancelar: (id: string) => Promise<void>;
}

const FILTROS: { id: StatusConviteAdmin | "todos"; label: string }[] = [
  { id: "pending", label: "Pendentes" },
  { id: "accepted", label: "Aceitos" },
  { id: "rejected", label: "Recusados" },
  { id: "todos", label: "Todos" },
];

const ROTULO_STATUS: Record<StatusConviteAdmin, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  rejected: "Recusado",
  expired: "Expirado",
};

export function ListaConvitesEnviados({ convites, filtro, onMudarFiltro, onCancelar }: Props) {
  async function handleCancelar(id: string) {
    try {
      await onCancelar(id);
      toast.success("Convite cancelado");
    } catch (err) {
      toast.error("Erro ao cancelar");
      console.error(err);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {FILTROS.map((f) => {
          const ativo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onMudarFiltro(f.id)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                ativo
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground border border-transparent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {convites.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Nenhum convite encontrado
        </p>
      ) : (
        <div className="space-y-2">
          {convites.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {c.driver_avatar_url && <AvatarImage src={c.driver_avatar_url} />}
                  <AvatarFallback>{c.driver_nome.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.driver_nome}</p>
                  {c.driver_handle && (
                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                      @{c.driver_handle}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    c.status === "pending"
                      ? "border-primary/30 text-primary bg-primary/10"
                      : c.status === "accepted"
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {ROTULO_STATUS[c.status]}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Enviado em {new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                {c.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => handleCancelar(c.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
