import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { CategoriaServico } from "@/compartilhados/types/tipos_categorias_servico";

interface CardCategoriaCadastroProps {
  categoria: CategoriaServico;
}

export function CardCategoriaCadastro({ categoria }: CardCategoriaCadastroProps) {
  const Icone = categoria.icone;
  const totalSubcategorias = categoria.subcategorias?.length ?? 0;

  return (
    <Link
      to={`/s/cadastrar/${categoria.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:bg-card/80 active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        <Icone className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {categoria.nome}
        </p>
        {totalSubcategorias > 0 && (
          <p className="text-xs text-muted-foreground">
            {totalSubcategorias} especialidades
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 flex-none text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}
