import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CategoriaFiltro,
  FiltrosDescobertaTribos,
} from "../types/tipos_descoberta_tribos";

interface Props {
  filtros: FiltrosDescobertaTribos;
  categorias: CategoriaFiltro[];
  cidades: string[];
  onChange: (proximos: FiltrosDescobertaTribos) => void;
}

const VALOR_TODOS = "__todos__";

export function BarraFiltrosTribos({ filtros, categorias, cidades, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filtros.busca ?? ""}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
          placeholder="Buscar tribo por nome..."
          className="pl-9"
        />
      </div>

      <Select
        value={filtros.categoriaSlug ?? VALOR_TODOS}
        onValueChange={(v) =>
          onChange({ ...filtros, categoriaSlug: v === VALOR_TODOS ? undefined : v })
        }
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={VALOR_TODOS}>Todas as categorias</SelectItem>
          {categorias.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filtros.cidade ?? VALOR_TODOS}
        onValueChange={(v) =>
          onChange({ ...filtros, cidade: v === VALOR_TODOS ? undefined : v })
        }
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={VALOR_TODOS}>Todas as cidades</SelectItem>
          {cidades.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
