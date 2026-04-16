import { Settings, Share2, Users, DollarSign } from "lucide-react";
import type { AbaPainel } from "../types/tipos_painel";

interface AcessoRapidoProps {
  onNavegar: (aba: AbaPainel) => void;
  onPrecos: () => void;
}

export function AcessoRapido({ onNavegar, onPrecos }: AcessoRapidoProps) {
  const itens = [
    { label: "Preços", icone: DollarSign, onClick: onPrecos },
    { label: "Minha Tribo", icone: Users, onClick: () => onNavegar("tribo") },
    { label: "Compartilhar", icone: Share2, onClick: () => onNavegar("tribo") },
    { label: "Carteira", icone: Settings, onClick: () => onNavegar("carteira") },
  ];

  return (
    <div className="flex gap-3 px-5 overflow-x-auto pb-1 scrollbar-none">
      {itens.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="flex flex-col items-center gap-1.5 min-w-[64px] py-2 px-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
        >
          <item.icone className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
