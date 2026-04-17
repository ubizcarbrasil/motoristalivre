import { formatarPreco } from "../utils/utilitarios_passageiro";

interface SugestoesOfertaProps {
  precoBase: number;
  valorAtual: number;
  onSelecionar: (valor: number) => void;
}

export function SugestoesOferta({ precoBase, valorAtual, onSelecionar }: SugestoesOfertaProps) {
  const base = Math.round(precoBase);
  const sugestoes = [
    { valor: Math.max(base - 2, 1), label: "-2" },
    { valor: Math.max(base - 1, 1), label: "-1" },
    { valor: base, label: "Sugerido", destaque: true },
    { valor: base + 2, label: "+2" },
    { valor: base + 5, label: "+5" },
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {sugestoes.map((s) => {
        const ativo = valorAtual === s.valor;
        return (
          <button
            key={`${s.label}-${s.valor}`}
            type="button"
            onClick={() => onSelecionar(s.valor)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
              ativo
                ? "bg-primary text-primary-foreground border-primary"
                : s.destaque
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-secondary text-foreground border-transparent hover:border-border"
            }`}
          >
            <span className="mr-1 opacity-70">{s.label}</span>
            <span className="font-semibold">{formatarPreco(s.valor)}</span>
          </button>
        );
      })}
    </div>
  );
}
