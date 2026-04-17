import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface OverlayBuscaMapaProps {
  grupoNome: string;
  onCancelar: () => void;
  cancelando?: boolean;
}

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function OverlayBuscaMapa({ grupoNome, onCancelar, cancelando = false }: OverlayBuscaMapaProps) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Pulso radial centralizado sobre a origem (centro do mapa) */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <div className="relative">
          <span className="absolute inset-0 -m-12 rounded-full bg-primary/20 animate-ping" />
          <span
            className="absolute inset-0 -m-20 rounded-full bg-primary/10 animate-ping"
            style={{ animationDelay: "0.6s" }}
          />
          <span
            className="absolute inset-0 -m-28 rounded-full bg-primary/5 animate-ping"
            style={{ animationDelay: "1.2s" }}
          />
          <div className="relative w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg" />
        </div>
      </div>

      {/* Card flutuante topo */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 safe-area-top pointer-events-none">
        <div className="mx-auto max-w-md bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-xl px-4 py-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                Buscando motoristas
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {grupoNome} · {formatarTempo(segundos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão cancelar fixo embaixo */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <Button
            variant="destructive"
            onClick={onCancelar}
            disabled={cancelando}
            className="w-full h-12 font-semibold shadow-xl"
          >
            {cancelando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            Cancelar solicitação
          </Button>
        </div>
      </div>
    </>
  );
}
