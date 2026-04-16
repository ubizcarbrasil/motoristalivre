import { Star, Clock, TrendingUp, Calendar } from "lucide-react";
import type { MetricasMotorista } from "../types/tipos_perfil_motorista";

interface Props {
  metricas: MetricasMotorista;
}

export function GridMetricas({ metricas }: Props) {
  const itens = [
    {
      icone: Star,
      label: "Nota media",
      valor: metricas.nota_media > 0 ? metricas.nota_media.toFixed(1) : "--",
      sub: `${metricas.total_avaliacoes} aval.`,
    },
    {
      icone: TrendingUp,
      label: "Taxa de aceite",
      valor: `${metricas.taxa_aceite}%`,
      sub: "corridas",
    },
    {
      icone: Clock,
      label: "Resposta",
      valor: "< 30s",
      sub: "tempo medio",
    },
    {
      icone: Calendar,
      label: "Atuacao",
      valor: `${metricas.meses_atuacao}`,
      sub: metricas.meses_atuacao === 1 ? "mes" : "meses",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 px-6">
      {itens.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-3"
        >
          <item.icone className="h-4 w-4 text-primary" />
          <span className="text-lg font-semibold text-foreground">{item.valor}</span>
          <span className="text-[10px] text-muted-foreground text-center leading-tight">
            {item.sub}
          </span>
        </div>
      ))}
    </div>
  );
}
