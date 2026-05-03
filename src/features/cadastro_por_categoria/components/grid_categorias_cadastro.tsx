import type { CategoriaServico } from "@/compartilhados/types/tipos_categorias_servico";
import { CardCategoriaCadastro } from "./card_categoria_cadastro";

interface GridCategoriasCadastroProps {
  categorias: CategoriaServico[];
}

export function GridCategoriasCadastro({ categorias }: GridCategoriasCadastroProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categorias.map((categoria) => (
        <CardCategoriaCadastro key={categoria.id} categoria={categoria} />
      ))}
    </div>
  );
}
