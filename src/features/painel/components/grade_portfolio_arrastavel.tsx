import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "@/features/motorista/types/tipos_vitrine";
import { CardItemPortfolioArrastavel } from "./card_item_portfolio_arrastavel";

interface Props {
  itens: ItemPortfolio[];
  servico?: TipoServico;
  onEditar: (item: ItemPortfolio) => void;
  onRemover: (item: ItemPortfolio) => void;
  onReordenar: (itensOrdenados: ItemPortfolio[]) => Promise<void> | void;
}

export function GradePortfolioArrastavel({
  itens,
  servico,
  onEditar,
  onRemover,
  onReordenar,
}: Props) {
  const [salvando, setSalvando] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = itens.findIndex((i) => i.id === active.id);
    const newIndex = itens.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const novaOrdem = arrayMove(itens, oldIndex, newIndex).map((it, idx) => ({
      ...it,
      ordem: idx,
    }));

    setSalvando(true);
    try {
      await onReordenar(novaOrdem);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itens.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-1.5">
          {itens.map((item) => (
            <CardItemPortfolioArrastavel
              key={item.id}
              item={item}
              servico={servico}
              onEditar={() => onEditar(item)}
              onRemover={() => onRemover(item)}
              desabilitarArrasto={salvando}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
