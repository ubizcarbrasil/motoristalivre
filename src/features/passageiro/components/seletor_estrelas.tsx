import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeletorEstrelasProps {
  valor: number;
  onMudar: (valor: number) => void;
}

export function SeletorEstrelas({ valor, onMudar }: SeletorEstrelasProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const ativa = n <= valor;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onMudar(n)}
            className={cn(
              "p-1 transition-transform duration-150 active:scale-90",
              ativa && "scale-110"
            )}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "w-10 h-10 transition-colors",
                ativa ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
