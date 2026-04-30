import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ItemPortfolio } from "../types/tipos_vitrine";

interface Props {
  itens: ItemPortfolio[];
}

export function CarrosselPortfolio({ itens }: Props) {
  const [aberto, setAberto] = useState<ItemPortfolio | null>(null);
  if (!itens || itens.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAberto(item)}
            className="snap-start shrink-0 h-20 w-28 rounded-lg overflow-hidden border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={item.image_url}
              alt={item.caption ?? "Trabalho"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-background border-border">
          {aberto && (
            <div className="flex flex-col">
              <img
                src={aberto.image_url}
                alt={aberto.caption ?? "Trabalho"}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              {aberto.caption && (
                <p className="text-xs text-muted-foreground p-3">{aberto.caption}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
