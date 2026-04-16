import { RESPOSTAS_RAPIDAS } from "../../constants/constantes_chat";

interface RespostasRapidasProps {
  onSelecionar: (texto: string) => void;
}

export function RespostasRapidas({ onSelecionar }: RespostasRapidasProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 pb-2" style={{ scrollbarWidth: "none" }}>
      {RESPOSTAS_RAPIDAS.map((texto) => (
        <button
          key={texto}
          type="button"
          onClick={() => onSelecionar(texto)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-border"
        >
          {texto}
        </button>
      ))}
    </div>
  );
}
