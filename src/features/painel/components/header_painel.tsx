import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import type { PerfilMotorista } from "../types/tipos_painel";

interface HeaderPainelProps {
  perfil: PerfilMotorista;
  tenantSlug: string;
  realtimeAtivo?: boolean;
  audioDestravado?: boolean;
  onToggleOnline: () => void;
}

function saudacao(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

interface BadgeStatus {
  texto: string;
  classe: string;
  Icone: typeof CheckCircle2;
}

function calcularStatus(online: boolean, realtime: boolean, audio: boolean): BadgeStatus | null {
  if (!online) return null;
  if (!realtime) {
    return {
      texto: "Sem conexão em tempo real",
      classe: "bg-destructive/15 text-destructive border-destructive/30",
      Icone: WifiOff,
    };
  }
  if (!audio) {
    return {
      texto: "Toque na tela pra ativar alertas",
      classe: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
      Icone: AlertTriangle,
    };
  }
  return {
    texto: "Pronto pra receber chamadas",
    classe: "bg-primary/15 text-primary border-primary/30",
    Icone: CheckCircle2,
  };
}

export function HeaderPainel({
  perfil,
  tenantSlug,
  realtimeAtivo = false,
  audioDestravado = false,
  onToggleOnline,
}: HeaderPainelProps) {
  const status = calcularStatus(perfil.is_online, realtimeAtivo, audioDestravado);

  return (
    <div className="px-5 pt-12 pb-4 space-y-3">
      <div className="flex items-center justify-between">
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
          <Switch checked={perfil.is_online} onCheckedChange={onToggleOnline} />
        </div>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${status.classe}`}
        >
          <status.Icone className="w-4 h-4 shrink-0" />
          <span className="truncate">{status.texto}</span>
        </div>
      )}
    </div>
  );
}
