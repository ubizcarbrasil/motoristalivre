import { Clock, DollarSign } from "lucide-react";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import { formatarDuracao } from "../utils/calcular_slots_disponiveis";

interface Props {
  servico: TipoServico | null;
  slotHora?: string | null;
  slotData?: string | null;
}

export function ResumoServicoSticky({ servico, slotHora, slotData }: Props) {
  if (!servico) return null;

  return (
    <div className="sticky top-[49px] z-[5] -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-md mx-auto flex items-center gap-3">
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
            Valor
          </p>
          <p className="text-base font-semibold text-primary">
            R$ {Number(servico.price).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
