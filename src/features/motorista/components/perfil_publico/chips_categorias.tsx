import { nomePorSlug } from "@/compartilhados/constants/constantes_categorias_servico";

interface ChipsCategoriasProps {
  categorias: string[];
  limite?: number;
}

/**
 * Chips de categoria com cara de pílula moderna,
 * usando accent verde sutil ao invés do cinza shadcn padrão.
 */
export function ChipsCategorias({ categorias, limite = 5 }: ChipsCategoriasProps) {
  if (!categorias || categorias.length === 0) return null;

  const visiveis = categorias.slice(0, limite);
  const restante = categorias.length - limite;

  return (
    <div className="max-w-3xl mx-auto px-5 mt-3 flex flex-wrap gap-1.5">
      {visiveis.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary"
        >
          {nomePorSlug(cat)}
        </span>
      ))}
      {restante > 0 && (
        <span className="inline-flex items-center rounded-full bg-secondary border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          +{restante}
        </span>
      )}
    </div>
  );
}
