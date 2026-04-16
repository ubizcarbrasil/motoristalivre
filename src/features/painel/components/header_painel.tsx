import { Switch } from "@/components/ui/switch";
import type { PerfilMotorista } from "../types/tipos_painel";

interface HeaderPainelProps {
  perfil: PerfilMotorista;
  tenantSlug: string;
  onToggleOnline: () => void;
}

function saudacao(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export function HeaderPainel({ perfil, tenantSlug, onToggleOnline }: HeaderPainelProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-4">
      <div>
        <p className="text-base font-semibold text-foreground">
          {saudacao()}, {perfil.nome.split(" ")[0]}
        </p>
        <p className="text-xs text-muted-foreground">{tenantSlug}.tribocar.com</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${perfil.is_online ? "text-primary" : "text-muted-foreground"}`}>
          {perfil.is_online ? "Online" : "Offline"}
        </span>
        <Switch
          checked={perfil.is_online}
          onCheckedChange={onToggleOnline}
        />
      </div>
    </div>
  );
}
