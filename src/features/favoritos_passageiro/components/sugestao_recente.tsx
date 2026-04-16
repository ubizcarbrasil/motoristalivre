import { Clock, Star } from "lucide-react";
import type { EnderecoRecente } from "../types/tipos_recentes";

interface SugestaoRecenteProps {
  recente: EnderecoRecente;
  onSelecionar: () => void;
  onFavoritar?: () => void;
  jaFavoritado?: boolean;
}

export function SugestaoRecente({
  recente,
  onSelecionar,
  onFavoritar,
  jaFavoritado,
}: SugestaoRecenteProps) {
  return (
    <div className="flex items-center border-b border-border last:border-0 hover:bg-secondary transition-colors">
      <button
        type="button"
        onClick={onSelecionar}
        className="flex-1 flex items-center gap-2 text-left px-3 py-2.5"
      >
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground line-clamp-1">{recente.address}</span>
      </button>
      {onFavoritar && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onFavoritar}
          className="p-2.5 mr-1 text-muted-foreground hover:text-primary transition-colors"
          title={jaFavoritado ? "Já favoritado" : "Favoritar este endereço"}
        >
          <Star className={`w-4 h-4 ${jaFavoritado ? "fill-primary text-primary" : ""}`} />
        </button>
      )}
    </div>
  );
}
