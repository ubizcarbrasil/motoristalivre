import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  busca: string;
  onMudarStatus: (status: FiltroStatus) => void;
  onMudarPeriodo: (periodo: FiltroPeriodo) => void;
  onMudarBusca: (busca: string) => void;
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
  busca,
  onMudarStatus,
  onMudarPeriodo,
  onMudarBusca,
  totalFiltrado,
  totalGeral,
}: FiltrosHistoricoCorridasProps) {
  const temFiltroAtivo = status !== "todas" || periodo !== "todos" || busca.trim() !== "";

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={busca}
          onChange={(e) => onMudarBusca(e.target.value)}
          placeholder="Buscar por motorista ou endereço"
          className="h-9 pl-8 pr-8 text-xs"
        />
        {busca && (
          <button
            type="button"
            onClick={() => onMudarBusca("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

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
              onMudarBusca("");
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
