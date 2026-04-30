import { useMemo } from "react";
import { Clock, Ban } from "lucide-react";
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
  fechado: boolean;
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
    // Sempre lista os 7 dias, começando na segunda
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    return ordem.map((dia) => {
      const intervalos = agrupado.get(dia);
      return {
        dia,
        intervalos: intervalos ? intervalos.sort() : [],
        fechado: !intervalos || intervalos.length === 0,
      };
    });
  }, [blocos]);

  const todosFechados = linhas.every((l) => l.fechado);

  if (todosFechados) {
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
            <span
              className={`text-sm font-medium ${
                linha.fechado ? "text-muted-foreground/60" : "text-foreground"
              }`}
            >
              {DIAS_NOMES[linha.dia]}
            </span>
            {linha.fechado ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Ban className="w-3 h-3" />
                <span>Fechado</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{linha.intervalos.join(" · ")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
