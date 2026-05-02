import { Star, TrendingUp, Clock, Calendar } from "lucide-react";
import type { MetricasMotorista } from "../types/tipos_perfil_motorista";

interface Props {
  metricas: MetricasMotorista;
}

/**
 * Métricas exibidas em uma "pill bar" horizontal estilo app —
 * cada item separado por divisor sutil, formato compacto.
 */
export function GridMetricas({ metricas }: Props) {
  const itens = [
    {
      icone: Star,
      valor: metricas.nota_media > 0 ? metricas.nota_media.toFixed(1) : "--",
      label: `${metricas.total_avaliacoes} aval.`,
      destaque: true,
    },
    {
      icone: TrendingUp,
      valor: `${metricas.taxa_aceite}%`,
      label: "aceite",
    },
    {
      icone: Clock,
      valor: "<30s",
      label: "resposta",
    },
    {
      icone: Calendar,
      valor: `${metricas.meses_atuacao}`,
      label: metricas.meses_atuacao === 1 ? "mês" : "meses",
    },
  ];

  return (
    <div className="px-4">
      <div className="flex items-stretch rounded-2xl bg-card border border-border overflow-hidden">
        {itens.map((item, idx) => (
          <div
            key={idx}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-1 ${
              idx > 0 ? "border-l border-border" : ""
            }`}
          >
            <div className="flex items-center gap-1">
              <item.icone
                className={`h-3.5 w-3.5 ${
                  item.destaque ? "text-primary fill-primary" : "text-muted-foreground"
                }`}
              />
              <span className="text-base font-semibold text-foreground leading-none">
                {item.valor}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
