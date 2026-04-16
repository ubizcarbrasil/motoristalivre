import { Plus } from "lucide-react";
import { IconeFavorito } from "@/features/favoritos_passageiro/components/icone_favorito";
import { ROTULOS_TIPO_FAVORITO, type FavoritoEndereco, type TipoFavorito } from "@/features/favoritos_passageiro/types/tipos_favoritos";

interface ChipsFavoritosRapidosProps {
  favoritos: FavoritoEndereco[];
  onUsar: (f: FavoritoEndereco) => void;
  onAdicionarTipo: (tipo: TipoFavorito) => void;
}

export function ChipsFavoritosRapidos({
  favoritos,
  onUsar,
  onAdicionarTipo,
}: ChipsFavoritosRapidosProps) {
  const home = favoritos.find((f) => f.type === "home");
  const work = favoritos.find((f) => f.type === "work");
  const outros = favoritos.filter((f) => f.type === "other").slice(0, 3);

  const renderChipPrincipal = (tipo: "home" | "work", favorito: FavoritoEndereco | undefined) => {
    if (favorito) {
      return (
        <button
          key={tipo}
          type="button"
          onClick={() => onUsar(favorito)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-full pl-2.5 pr-3.5 py-1.5 shrink-0"
        >
          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <IconeFavorito type={tipo} className="w-3 h-3" />
          </span>
          <span className="text-[11px] font-semibold text-foreground">{favorito.label}</span>
        </button>
      );
    }
    return (
      <button
        key={tipo}
        type="button"
        onClick={() => onAdicionarTipo(tipo)}
        className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary border border-dashed border-border rounded-full pl-2.5 pr-3.5 py-1.5 shrink-0"
      >
        <span className="w-6 h-6 rounded-full bg-muted/40 text-muted-foreground flex items-center justify-center">
          <IconeFavorito type={tipo} className="w-3 h-3" />
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          Adicionar {ROTULOS_TIPO_FAVORITO[tipo].toLowerCase()}
        </span>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {renderChipPrincipal("home", home)}
      {renderChipPrincipal("work", work)}
      {outros.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onUsar(f)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-full pl-2.5 pr-3.5 py-1.5 shrink-0"
        >
          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <IconeFavorito type="other" className="w-3 h-3" />
          </span>
          <span className="text-[11px] font-semibold text-foreground max-w-[90px] truncate">
            {f.label}
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onAdicionarTipo("other")}
        className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary/60 hover:bg-secondary border border-dashed border-border text-muted-foreground shrink-0"
        aria-label="Adicionar favorito"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
