import { Star } from "lucide-react";
import { IconeFavorito } from "@/features/favoritos_passageiro/components/icone_favorito";
import type { FavoritoEndereco } from "@/features/favoritos_passageiro/types/tipos_favoritos";

interface SugestaoFavoritoProps {
  favorito: FavoritoEndereco;
  onSelecionar: () => void;
}

export function SugestaoFavorito({ favorito, onSelecionar }: SugestaoFavoritoProps) {
  return (
    <button
      type="button"
      onClick={onSelecionar}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors border-b border-border text-left"
    >
      <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <IconeFavorito type={favorito.type} className="w-3.5 h-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          {favorito.label}
          <Star className="w-3 h-3 text-primary fill-primary" />
        </p>
        <p className="text-[11px] text-muted-foreground line-clamp-1">{favorito.address}</p>
      </div>
    </button>
  );
}
