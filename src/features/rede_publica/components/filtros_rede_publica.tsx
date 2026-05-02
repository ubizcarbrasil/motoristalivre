import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  iconePorSlug,
  nomePorSlug,
} from "@/compartilhados/constants/constantes_categorias_servico";
import type { FiltroStatusRede } from "../types/tipos_rede";

interface Props {
  busca: string;
  onBusca: (v: string) => void;
  categoria: string | null;
  onCategoria: (slug: string | null) => void;
  status: FiltroStatusRede;
  onStatus: (s: FiltroStatusRede) => void;
  categoriasDisponiveis: string[];
}

const STATUS_OPCOES: { id: FiltroStatusRede; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "disponivel", rotulo: "Disponíveis" },
  { id: "ocupado", rotulo: "Ocupados" },
  { id: "sem_agenda", rotulo: "Sem agenda" },
];

export function FiltrosRedePublica({
  busca,
  onBusca,
  categoria,
  onCategoria,
  status,
  onStatus,
  categoriasDisponiveis,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="pl-9 h-10"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPCOES.map((op) => {
          const ativo = status === op.id;
          return (
            <button
              key={op.id}
              type="button"
              onClick={() => onStatus(op.id)}
              className={`px-3 py-1 rounded-full text-[11px] border transition-colors ${
                ativo
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {op.rotulo}
            </button>
          );
        })}
      </div>

      {categoriasDisponiveis.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onCategoria(null)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
              categoria === null
                ? "bg-primary/15 text-primary border-primary/40"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas as categorias
          </button>
          {categoriasDisponiveis.map((slug) => {
            const Icone = iconePorSlug(slug);
            const ativo = categoria === slug;
            return (
              <Badge
                key={slug}
                onClick={() => onCategoria(ativo ? null : slug)}
                variant="outline"
                className={`cursor-pointer gap-1.5 py-1 text-[11px] ${
                  ativo
                    ? "border-primary/40 text-primary bg-primary/5"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icone className="h-3 w-3" />
                {nomePorSlug(slug)}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
