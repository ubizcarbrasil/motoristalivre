import { Pencil, Trash2 } from "lucide-react";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "@/features/motorista/types/tipos_vitrine";

interface Props {
  item: ItemPortfolio;
  servico?: TipoServico;
  onEditar: () => void;
  onRemover: () => void;
}

export function CardItemPortfolio({ item, servico, onEditar, onRemover }: Props) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border border-border bg-card group">
      <img
        src={item.image_url}
        alt={item.caption ?? servico?.name ?? "Trabalho"}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {item.caption && (
        <span className="absolute bottom-1 left-1 right-1 truncate rounded-sm bg-background/70 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-foreground">
          {item.caption}
        </span>
      )}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEditar}
          className="rounded-full bg-background/85 p-1.5 text-foreground hover:text-primary"
          aria-label="Editar"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onRemover}
          className="rounded-full bg-background/85 p-1.5 text-destructive hover:text-destructive"
          aria-label="Remover"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
