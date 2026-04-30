import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";

interface Props {
  servicos: TipoServico[];
  servicoSelecionado: string;
  onSelecionarServico: (id: string) => void;
  busca: string;
  onBuscar: (texto: string) => void;
}

export function FiltrosPortfolio({
  servicos,
  servicoSelecionado,
  onSelecionarServico,
  busca,
  onBuscar,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscar por descrição..."
          className="pl-9"
          aria-label="Buscar trabalhos"
        />
      </div>

      <Select value={servicoSelecionado} onValueChange={onSelecionarServico}>
        <SelectTrigger className="sm:w-56" aria-label="Filtrar por serviço">
          <SelectValue placeholder="Todos os serviços" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os serviços</SelectItem>
          {servicos.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
