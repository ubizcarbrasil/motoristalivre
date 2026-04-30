import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  paginaAtual: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

export function PaginacaoPortfolio({ paginaAtual, totalPaginas, onMudarPagina }: Props) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onMudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      <span className="text-xs text-muted-foreground">
        Página {paginaAtual} de {totalPaginas}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onMudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="gap-1"
      >
        Próxima
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
