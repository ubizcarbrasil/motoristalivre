import type { CategoriaServico } from "../types/tipos_orcamento";
import { ChipOpcao } from "./chip_opcao";

interface Props {
  categorias: CategoriaServico[];
  selecionada: string | null;
  onSelecionar: (id: string) => void;
}

export function PassoCategoria({ categorias, selecionada, onSelecionar }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">O que você precisa?</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha a categoria do serviço.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categorias.map((c) => (
          <ChipOpcao
            key={c.id}
            rotulo={c.nome}
            ativo={selecionada === c.id}
            onClick={() => onSelecionar(c.id)}
            className="h-20 text-base"
          />
        ))}
      </div>
    </div>
  );
}
