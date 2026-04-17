import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertTriangle, WifiOff, Loader2 } from "lucide-react";
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

const TEMPO_TOLERANCIA_OFFLINE_MS = 10000;

function calcularStatus(
  online: boolean,
  realtime: boolean,
  audio: boolean,
  conectando: boolean,
): BadgeStatus | null {
  if (!online) return null;
  if (!realtime) {
    if (conectando) {
      return {
        texto: "Conectando…",
        classe: "bg-muted text-muted-foreground border-border",
        Icone: Loader2,
      };
    }
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
  // Estado "conectando" = realtime ainda não ficou ativo OU caiu há menos de 10s
  const [conectando, setConectando] = useState(true);
  const ultimoOnlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (realtimeAtivo) {
      ultimoOnlineRef.current = Date.now();
      setConectando(false);
      return;
    }
    // Realtime caiu — dar tolerância antes de mostrar vermelho
    setConectando(true);
    const desde = ultimoOnlineRef.current ?? Date.now();
    const restante = Math.max(0, TEMPO_TOLERANCIA_OFFLINE_MS - (Date.now() - desde));
    const timer = window.setTimeout(() => setConectando(false), restante);
    return () => window.clearTimeout(timer);
  }, [realtimeAtivo]);

  const status = calcularStatus(perfil.is_online, realtimeAtivo, audioDestravado, conectando);

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
          <status.Icone className={`w-4 h-4 shrink-0 ${status.Icone === Loader2 ? "animate-spin" : ""}`} />
          <span className="truncate">{status.texto}</span>
        </div>
      )}
    </div>
  );
}
