import { useMemo } from "react";
import { Clock } from "lucide-react";
import type { DisponibilidadeProfissional } from "@/features/servicos/types/tipos_servicos";

interface Props {
  blocos: DisponibilidadeProfissional[];
}

const DIAS_NOMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function formatarHora(hora: string): string {
  return hora.slice(0, 5);
}

interface LinhaDisponibilidade {
  dia: number;
  intervalos: string[];
}

export function BlocosDisponibilidade({ blocos }: Props) {
  const linhas = useMemo<LinhaDisponibilidade[]>(() => {
    const ativos = blocos.filter((b) => b.is_active);
    const agrupado = new Map<number, string[]>();
    for (const b of ativos) {
      const intervalo = `${formatarHora(b.start_time)}–${formatarHora(b.end_time)}`;
      const lista = agrupado.get(b.day_of_week) ?? [];
      lista.push(intervalo);
      agrupado.set(b.day_of_week, lista);
    }
    return Array.from(agrupado.entries())
      .sort(([a], [b]) => a - b)
      .map(([dia, intervalos]) => ({ dia, intervalos: intervalos.sort() }));
  }, [blocos]);

  if (linhas.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Disponibilidade</h2>
        <p className="text-xs text-muted-foreground">
          Este profissional ainda não cadastrou horários de atendimento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Disponibilidade</h2>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {linhas.map((linha) => (
          <div
            key={linha.dia}
            className="flex items-center justify-between px-3 py-2"
          >
            <span className="text-sm font-medium text-foreground">
              {DIAS_NOMES[linha.dia]}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{linha.intervalos.join(" · ")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
