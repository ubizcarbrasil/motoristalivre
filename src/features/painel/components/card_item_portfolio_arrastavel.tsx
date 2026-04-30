import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "@/features/motorista/types/tipos_vitrine";

interface Props {
  item: ItemPortfolio;
  servico?: TipoServico;
  onEditar: () => void;
  onRemover: () => void;
  desabilitarArrasto?: boolean;
}

export function CardItemPortfolioArrastavel({
  item,
  servico,
  onEditar,
  onRemover,
  desabilitarArrasto,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: desabilitarArrasto });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden border bg-card touch-none ${
        isDragging
          ? "border-primary ring-2 ring-primary/40 shadow-lg opacity-90"
          : "border-border"
      }`}
    >
      <img
        src={item.image_url}
        alt={item.caption ?? servico?.name ?? "Trabalho"}
        loading="lazy"
        draggable={false}
        className="h-full w-full object-cover pointer-events-none select-none"
      />

      {item.caption && (
        <span className="absolute bottom-1 left-1 right-1 truncate rounded-sm bg-background/70 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-foreground">
          {item.caption}
        </span>
      )}

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
        className="absolute top-1 left-1 rounded-full bg-background/85 p-1.5 text-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {/* Ações */}
      <div className="absolute top-1 right-1 flex gap-1">
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
          className="rounded-full bg-background/85 p-1.5 text-destructive"
          aria-label="Remover"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
