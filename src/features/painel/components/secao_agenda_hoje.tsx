import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AgendamentoComCliente } from "@/features/servicos/types/tipos_servicos";

interface SecaoAgendaHojeProps {
  agendamentos: AgendamentoComCliente[];
}

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  confirmed: { label: "Confirmado", variant: "default" },
  in_progress: { label: "Em andamento", variant: "secondary" },
  completed: { label: "Concluído", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "outline" },
  no_show: { label: "Não compareceu", variant: "outline" },
};

function formatarHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function anonimizar(nome: string) {
  const partes = nome.trim().split(" ");
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`;
}

export function SecaoAgendaHoje({ agendamentos }: SecaoAgendaHojeProps) {
  return (
    <section className="px-4 space-y-2">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Agenda de hoje</h2>
        <span className="text-[11px] text-muted-foreground">
          {agendamentos.length} agendamento{agendamentos.length === 1 ? "" : "s"}
        </span>
      </div>

      {agendamentos.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhum agendamento para hoje</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agendamentos.map((a) => {
            const status = STATUS_LABEL[a.status] ?? STATUS_LABEL.pending;
            const nomeMostrar = a.status === "pending" ? anonimizar(a.cliente_nome) : a.cliente_nome;
            return (
              <div
                key={a.id}
                className="rounded-xl bg-card border border-border p-3 flex items-center gap-3"
              >
                <div className="flex flex-col items-center justify-center min-w-[52px] rounded-lg bg-secondary/60 px-2 py-1.5">
                  <span className="text-base font-bold text-foreground leading-none">
                    {formatarHora(a.scheduled_at)}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {a.duration_minutes} min
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{nomeMostrar}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.servico_nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    R$ {Number(a.price_agreed).toFixed(2)}
                  </p>
                  <Badge variant={status.variant} className="text-[10px] mt-0.5">
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
