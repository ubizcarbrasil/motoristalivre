import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Zap, ImageIcon } from "lucide-react";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "../types/tipos_vitrine";
import { formatarDuracao } from "@/features/passageiro/utils/calcular_slots_disponiveis";
import { CarrosselPortfolio } from "./carrossel_portfolio";

interface Props {
  servicos: TipoServico[];
  portfolio: ItemPortfolio[];
  tenantSlug: string;
  driverSlug: string;
}

export function SecaoServicosPublica({ servicos, portfolio, tenantSlug, driverSlug }: Props) {
  const navigate = useNavigate();
  if (servicos.length === 0) return null;

  const portfolioPorServico = new Map<string, ItemPortfolio[]>();
  for (const item of portfolio) {
    const lista = portfolioPorServico.get(item.service_type_id) ?? [];
    lista.push(item);
    portfolioPorServico.set(item.service_type_id, lista);
  }

  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Serviços disponíveis</h2>
      </div>
      <div className="space-y-3">
        {servicos.map((s) => {
          const itens = portfolioPorServico.get(s.id) ?? [];
          return (
            <div
              key={s.id}
              className="rounded-xl bg-card border border-border p-3 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    {s.is_immediate && (
                      <Badge
                        variant="outline"
                        className="border-primary text-primary gap-1 px-1.5 py-0 h-5"
                      >
                        <Zap className="w-3 h-3" />
                        Imediato
                      </Badge>
                    )}
                    {itens.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground gap-1 px-1.5 py-0 h-5"
                      >
                        <ImageIcon className="w-3 h-3" />
                        {itens.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formatarDuracao(s.duration_minutes)} · R$ {Number(s.price).toFixed(2)}
                  </p>
                  {s.description && (
                    <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/${tenantSlug}/servicos/${driverSlug}?servico=${s.id}`)
                  }
                >
                  Agendar
                </Button>
              </div>

              {itens.length > 0 && <CarrosselPortfolio itens={itens} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
