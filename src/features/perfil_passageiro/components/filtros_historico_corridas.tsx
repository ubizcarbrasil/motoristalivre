import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FiltroStatus = "todas" | "concluidas" | "canceladas";
export type FiltroPeriodo = "todos" | "7dias" | "30dias" | "90dias";

interface FiltrosHistoricoCorridasProps {
  status: FiltroStatus;
  periodo: FiltroPeriodo;
  onMudarStatus: (status: FiltroStatus) => void;
  onMudarPeriodo: (periodo: FiltroPeriodo) => void;
  totalFiltrado: number;
  totalGeral: number;
}

const OPCOES_STATUS: { value: FiltroStatus; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "concluidas", label: "Concluídas" },
  { value: "canceladas", label: "Canceladas" },
];

const OPCOES_PERIODO: { value: FiltroPeriodo; label: string }[] = [
  { value: "todos", label: "Todo o período" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "30dias", label: "Últimos 30 dias" },
  { value: "90dias", label: "Últimos 90 dias" },
];

export function FiltrosHistoricoCorridas({
  status,
  periodo,
  onMudarStatus,
  onMudarPeriodo,
  totalFiltrado,
  totalGeral,
}: FiltrosHistoricoCorridasProps) {
  const temFiltroAtivo = status !== "todas" || periodo !== "todos";

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {OPCOES_STATUS.map((opcao) => {
          const ativo = status === opcao.value;
          return (
            <button
              key={opcao.value}
              type="button"
              onClick={() => onMudarStatus(opcao.value)}
              className={`flex-1 text-[11px] font-semibold py-2 rounded-lg transition-colors ${
                ativo
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {opcao.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Select value={periodo} onValueChange={(v) => onMudarPeriodo(v as FiltroPeriodo)}>
          <SelectTrigger className="h-9 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPCOES_PERIODO.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value} className="text-xs">
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {temFiltroAtivo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onMudarStatus("todas");
              onMudarPeriodo("todos");
            }}
            className="h-9 text-[11px] px-2 shrink-0"
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Filter className="w-3 h-3" />
        <span>
          {totalFiltrado} de {totalGeral} corrida{totalGeral === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
