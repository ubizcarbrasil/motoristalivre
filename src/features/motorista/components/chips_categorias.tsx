import { Badge } from "@/components/ui/badge";
import { nomePorSlug } from "@/compartilhados/constants/constantes_categorias_servico";

interface Props {
  categorias: string[];
  selecionadas?: string[];
  onToggle?: (categoria: string) => void;
}

export function ChipsCategorias({ categorias, selecionadas, onToggle }: Props) {
  if (!categorias || categorias.length === 0) return null;
  const interativo = !!onToggle;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 px-6">
      {categorias.map((c) => {
        const ativa = selecionadas?.includes(c) ?? false;
        const classeBase =
          "text-[11px] px-2 py-0.5 transition-colors";
        const classeEstado = ativa
          ? "bg-primary text-primary-foreground border-primary"
          : "border-primary/40 text-primary bg-primary/5";
        const classeInterativo = interativo
          ? "cursor-pointer hover:border-primary"
          : "";

        if (!interativo) {
          return (
            <Badge
              key={c}
              variant="outline"
              className={`${classeBase} ${classeEstado}`}
            >
              {nomePorSlug(c)}
            </Badge>
          );
        }

        return (
          <button
            key={c}
            type="button"
            onClick={() => onToggle?.(c)}
            aria-pressed={ativa}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          >
            <Badge
              variant="outline"
              className={`${classeBase} ${classeEstado} ${classeInterativo}`}
            >
              {nomePorSlug(c)}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
