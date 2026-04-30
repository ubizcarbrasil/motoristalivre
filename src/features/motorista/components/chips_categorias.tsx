import { Badge } from "@/components/ui/badge";

interface Props {
  categorias: string[];
}

export function ChipsCategorias({ categorias }: Props) {
  if (!categorias || categorias.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 px-6">
      {categorias.map((c) => (
        <Badge
          key={c}
          variant="outline"
          className="border-primary/40 text-primary bg-primary/5 text-[11px] px-2 py-0.5"
        >
          {c}
        </Badge>
      ))}
    </div>
  );
}
