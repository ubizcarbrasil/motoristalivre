import { DollarSign, Car, Percent, Star } from "lucide-react";
import type { EstatisticasHoje } from "../types/tipos_painel";

interface GridStatsProps {
  stats: EstatisticasHoje;
}

export function GridStats({ stats }: GridStatsProps) {
  const itens = [
    {
      label: "Faturamento",
      valor: `R$${stats.faturamento.toFixed(2).replace(".", ",")}`,
      icone: DollarSign,
      cor: "text-primary",
    },
    {
      label: "Corridas",
      valor: String(stats.corridas),
      icone: Car,
      cor: "text-foreground",
    },
    {
      label: "Comissões",
      valor: `R$${stats.comissoes.toFixed(2).replace(".", ",")}`,
      icone: Percent,
      cor: "text-primary",
    },
    {
      label: "Avaliação",
      valor: stats.avaliacao > 0 ? stats.avaliacao.toFixed(1) : "—",
      icone: Star,
      cor: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {itens.map((item) => (
        <div key={item.label} className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <item.icone className={`w-4 h-4 ${item.cor}`} />
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
          </div>
          <p className="text-lg font-bold text-foreground">{item.valor}</p>
        </div>
      ))}
    </div>
  );
}
