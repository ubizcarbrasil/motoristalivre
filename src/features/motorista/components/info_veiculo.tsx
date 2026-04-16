import { Car } from "lucide-react";
import type { PerfilPublicoMotorista } from "../types/tipos_perfil_motorista";

interface Props {
  perfil: PerfilPublicoMotorista;
}

export function InfoVeiculo({ perfil }: Props) {
  if (!perfil.vehicle_model) return null;

  const detalhes = [
    perfil.vehicle_model,
    perfil.vehicle_year,
    perfil.vehicle_color,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-6 rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{detalhes}</p>
          {perfil.vehicle_plate && (
            <p className="text-xs text-muted-foreground font-mono">
              {perfil.vehicle_plate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
