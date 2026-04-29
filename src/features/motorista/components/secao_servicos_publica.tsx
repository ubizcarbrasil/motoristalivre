import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Zap } from "lucide-react";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import { formatarDuracao } from "@/features/passageiro/utils/calcular_slots_disponiveis";

interface Props {
  servicos: TipoServico[];
  tenantSlug: string;
  driverSlug: string;
}

export function SecaoServicosPublica({ servicos, tenantSlug, driverSlug }: Props) {
  const navigate = useNavigate();
  if (servicos.length === 0) return null;

  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Serviços disponíveis</h2>
      </div>
      <div className="space-y-2">
        {servicos.map((s) => (
          <div
            key={s.id}
            className="rounded-xl bg-card border border-border p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                {s.is_immediate && (
                  <Badge variant="outline" className="border-primary text-primary gap-1 px-1.5 py-0 h-5">
                    <Zap className="w-3 h-3" />
                    Imediato
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatarDuracao(s.duration_minutes)} · R$ {Number(s.price).toFixed(2)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/${tenantSlug}/${driverSlug}?servico=${s.id}`)}
            >
              Agendar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
