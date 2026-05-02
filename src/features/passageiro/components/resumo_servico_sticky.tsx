import { Clock, DollarSign } from "lucide-react";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import { formatarDuracao } from "../utils/calcular_slots_disponiveis";
import type { LinhaCalculo } from "@/features/servicos/utils/calculadora_preco_servico";

interface Props {
  servico: TipoServico | null;
  slotHora?: string | null;
  slotData?: string | null;
  total?: number | null;
  linhasFatores?: LinhaCalculo[];
  travelFee?: number;
}

export function ResumoServicoSticky({
  servico,
  slotHora,
  slotData,
  total,
  linhasFatores,
  travelFee,
}: Props) {
  if (!servico) return null;

  const totalFinal = typeof total === "number" ? total : Number(servico.price);
  const temBreakdown = (linhasFatores && linhasFatores.length > 0) || (travelFee && travelFee > 0);

  return (
    <div className="sticky top-[49px] z-[5] -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-md mx-auto space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Selecionado
            </p>
            <p className="text-sm font-semibold text-foreground truncate">{servico.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatarDuracao(servico.duration_minutes)}
              </span>
              {slotData && slotHora && (
                <span className="text-[11px] text-primary font-medium">
                  {slotData} · {slotHora}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 justify-end">
              <DollarSign className="w-3 h-3" />
              Total
            </p>
            <p className="text-base font-semibold text-primary">
              R$ {totalFinal.toFixed(2)}
            </p>
          </div>
        </div>
        {temBreakdown && (
          <div className="text-[10px] text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
            <div className="flex justify-between">
              <span>Base</span>
              <span>R$ {Number(servico.price).toFixed(2)}</span>
            </div>
            {linhasFatores?.map((l, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="truncate">{l.rotulo}</span>
                <span className="shrink-0">
                  {l.valor >= 0 ? "+" : ""}R$ {l.valor.toFixed(2)}
                </span>
              </div>
            ))}
            {travelFee && travelFee > 0 ? (
              <div className="flex justify-between">
                <span>Deslocamento</span>
                <span>+R$ {travelFee.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
