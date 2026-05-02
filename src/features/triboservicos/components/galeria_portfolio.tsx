import { useEffect, useState } from "react";
import { X, ImageOff } from "lucide-react";
import type { ItemPortfolio } from "../services/servico_vitrine_publica";
import { thumbnailsParaCategorias } from "@/compartilhados/utils/imagens_categorias";

interface Props {
  itens: ItemPortfolio[];
  mensagemVazio?: string;
  /** Quando o profissional ainda não tem trabalhos, exibe imagens
   *  ilustrativas (Unsplash) baseadas nas especialidades, marcadas
   *  como "Exemplo" para não confundir o usuário. */
  categoriasFallback?: string[];
}

export function GaleriaPortfolio({ itens, mensagemVazio, categoriasFallback }: Props) {
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
    const placeholders =
      categoriasFallback && categoriasFallback.length > 0
        ? thumbnailsParaCategorias(categoriasFallback, 6)
        : [];

    if (placeholders.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <ImageOff className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {mensagemVazio ??
              "Este profissional ainda não publicou trabalhos no portfólio."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground">
          Imagens ilustrativas dos serviços oferecidos. O profissional ainda não
          publicou trabalhos próprios.
        </p>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {placeholders.map((url, idx) => (
            <div
              key={url + idx}
              className="relative aspect-square overflow-hidden rounded-lg bg-secondary"
            >
              <img
                src={url}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute top-1 left-1 rounded bg-background/80 backdrop-blur px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                Exemplo
              </span>
            </div>
          ))}
        </div>
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
