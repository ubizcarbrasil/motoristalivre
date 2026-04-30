import { Sun, Sunset, Moon } from "lucide-react";
import type { SlotDisponivel } from "../utils/calcular_slots_disponiveis";

interface Props {
  slots: SlotDisponivel[];
  selecionado: SlotDisponivel | null;
  onSelecionar: (s: SlotDisponivel) => void;
}

interface Periodo {
  chave: "manha" | "tarde" | "noite";
  titulo: string;
  icone: typeof Sun;
  filtro: (hora: number) => boolean;
}

const PERIODOS: Periodo[] = [
  { chave: "manha", titulo: "Manhã", icone: Sun, filtro: (h) => h < 12 },
  { chave: "tarde", titulo: "Tarde", icone: Sunset, filtro: (h) => h >= 12 && h < 18 },
  { chave: "noite", titulo: "Noite", icone: Moon, filtro: (h) => h >= 18 },
];

export function GradeSlotsPeriodo({ slots, selecionado, onSelecionar }: Props) {
  if (slots.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        Sem horários disponíveis para o serviço neste dia.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {PERIODOS.map((p) => {
        const lista = slots.filter((s) => {
          const h = parseInt(s.hora.slice(0, 2), 10);
          return p.filtro(h);
        });
        if (lista.length === 0) return null;
        const Icone = p.icone;
        return (
          <div key={p.chave} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Icone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                {p.titulo}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {lista.map((s) => {
                const ativo = selecionado?.iso === s.iso;
                return (
                  <button
                    key={s.iso}
                    type="button"
                    onClick={() => onSelecionar(s)}
                    className={`h-10 rounded-lg text-sm font-mono font-medium transition-colors border ${
                      ativo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {s.hora}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
