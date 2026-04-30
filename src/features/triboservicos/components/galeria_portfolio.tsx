import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ItemPortfolio } from "../services/servico_vitrine_publica";

interface Props {
  itens: ItemPortfolio[];
  mensagemVazio?: string;
}

export function GaleriaPortfolio({ itens, mensagemVazio }: Props) {
  const [aberto, setAberto] = useState<ItemPortfolio | null>(null);

  useEffect(() => {
    if (!aberto) return;
    function fecharComEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(null);
    }
    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [aberto]);

  if (itens.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {mensagemVazio ??
            "Este profissional ainda não publicou trabalhos no portfólio."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {itens.map((item) => (
          <button
            key={item.id}
            onClick={() => setAberto(item)}
            className="relative aspect-square overflow-hidden rounded-lg bg-secondary group focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={item.caption ?? "Ver trabalho"}
          >
            <img
              src={item.image_url}
              alt={item.caption ?? "Trabalho do profissional"}
              loading="lazy"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {aberto && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setAberto(null)}
        >
          <button
            onClick={() => setAberto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-secondary/80"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={aberto.image_url}
            alt={aberto.caption ?? "Trabalho"}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {aberto.caption && (
            <p className="mt-4 text-sm text-foreground text-center max-w-md">
              {aberto.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
