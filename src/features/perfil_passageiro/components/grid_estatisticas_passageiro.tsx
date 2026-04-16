import { Car, DollarSign, Gift } from "lucide-react";
import type { DadosPerfilPassageiro } from "../types/tipos_perfil_passageiro";

interface GridEstatisticasPassageiroProps {
  perfil: DadosPerfilPassageiro;
}

function CardStat({ icone, valor, label }: { icone: React.ReactNode; valor: string; label: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-3 text-center">
      <div className="flex justify-center mb-1">{icone}</div>
      <p className="text-sm font-bold text-foreground">{valor}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function GridEstatisticasPassageiro({ perfil }: GridEstatisticasPassageiroProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <CardStat
        icone={<Car className="w-4 h-4 text-primary" />}
        valor={perfil.total_rides.toString()}
        label="Corridas"
      />
      <CardStat
        icone={<DollarSign className="w-4 h-4 text-primary" />}
        valor={`R$${perfil.total_spent.toFixed(0)}`}
        label="Gasto"
      />
      <CardStat
        icone={<Gift className="w-4 h-4 text-primary" />}
        valor={`R$${perfil.cashback_balance.toFixed(2).replace(".", ",")}`}
        label="Cashback"
      />
    </div>
  );
}
