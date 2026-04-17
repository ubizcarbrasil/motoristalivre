import { Share2, Users, DollarSign, Car, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AbaPainel } from "../types/tipos_painel";

interface AcessoRapidoProps {
  onNavegar: (aba: AbaPainel) => void;
  tenantSlug: string;
}

export function AcessoRapido({ onNavegar, tenantSlug }: AcessoRapidoProps) {
  const navigate = useNavigate();

  const itens = [
    {
      label: "Solicitar corrida",
      icone: Car,
      destaque: true,
      onClick: () => navigate(`/${tenantSlug}`),
    },
    { label: "Preços", icone: DollarSign, onClick: () => onNavegar("configuracoes") },
    { label: "Meus Links", icone: Share2, onClick: () => onNavegar("meus_links") },
    { label: "Grupos", icone: Users, onClick: () => onNavegar("configuracoes") },
    { label: "Instalar app", icone: Download, onClick: () => navigate("/instalar") },
  ];

  return (
    <div className="flex gap-3 px-5 overflow-x-auto pb-1 scrollbar-none">
      {itens.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={`flex flex-col items-center gap-1.5 min-w-[68px] py-2 px-3 rounded-xl border transition-colors ${
            item.destaque
              ? "bg-primary/10 border-primary/40 hover:border-primary"
              : "bg-card border-border hover:border-primary/30"
          }`}
        >
          <item.icone
            className={`w-4 h-4 ${item.destaque ? "text-primary" : "text-muted-foreground"}`}
          />
          <span
            className={`text-[10px] whitespace-nowrap ${
              item.destaque ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
