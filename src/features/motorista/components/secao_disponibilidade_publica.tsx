import { CalendarDays } from "lucide-react";
import type { DisponibilidadeProfissional } from "@/features/servicos/types/tipos_servicos";

interface Props {
  blocos: DisponibilidadeProfissional[];
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function SecaoDisponibilidadePublica({ blocos }: Props) {
  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Disponibilidade</h2>
      </div>
      <div className="rounded-xl bg-card border border-border p-3 space-y-2">
        {DIAS.map((dia, idx) => {
          const blocosDoDia = blocos.filter((b) => b.day_of_week === idx);
          return (
            <div
              key={dia}
              className="flex items-start gap-3 py-1.5 border-b border-border last:border-0"
            >
              <span className="text-xs font-medium text-muted-foreground w-10 pt-1">{dia}</span>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {blocosDoDia.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">—</span>
                ) : (
                  blocosDoDia.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-1 text-[11px] font-mono text-foreground"
                    >
                      {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
