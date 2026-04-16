import { useEffect, useState } from "react";
import { User } from "lucide-react";

interface OverlayBuscaProps {
  grupoNome: string;
}

export function OverlayBusca({ grupoNome }: OverlayBuscaProps) {
  const [ponto, setPonto] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPonto((p) => (p + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const pontosTexto = ".".repeat(ponto);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center gap-8">
      {/* Ring spinner */}
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />

        {/* Avatares simulados */}
        <div className="absolute inset-3 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-base font-medium text-foreground">
          Buscando motoristas{pontosTexto}
        </p>
        <p className="text-sm text-muted-foreground">{grupoNome}</p>
      </div>
    </div>
  );
}
