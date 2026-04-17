import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Link, Loader2, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DispatchAtivo } from "../types/tipos_painel";
import { TIMEOUT_DISPATCH_SEG } from "../constants/constantes_painel";

interface CardDispatchProps {
  dispatch: DispatchAtivo;
  timeoutSec?: number;
  silenciado?: boolean;
  onAlternarSom?: () => void;
  onAceitar: () => void | Promise<void>;
  onRecusar: () => void | Promise<void>;
  onTimeout?: () => void | Promise<void>;
}

export function CardDispatch({
  dispatch,
  timeoutSec = TIMEOUT_DISPATCH_SEG,
  silenciado,
  onAlternarSom,
  onAceitar,
  onRecusar,
  onTimeout,
}: CardDispatchProps) {
  const [restante, setRestante] = useState(timeoutSec);
  const [acao, setAcao] = useState<"aceitar" | "recusar" | null>(null);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - new Date(dispatch.dispatched_at).getTime()) / 1000);
    const inicial = Math.max(0, timeoutSec - elapsed);
    setRestante(inicial);

    if (inicial === 0) {
      onTimeout?.();
      return;
    }

    const timer = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch.dispatched_at, timeoutSec]);

  const progresso = (restante / timeoutSec) * 100;
  const desabilitado = acao !== null;

  // Cores progressivas: > 30s primary, 15-30s amber, < 15s destructive
  const corBarra =
    restante > 30 ? "bg-primary" : restante > 15 ? "bg-amber-500" : "bg-destructive";
  const corContador =
    restante > 30 ? "text-primary" : restante > 15 ? "text-amber-500" : "text-destructive";
  const intensoUrgente = restante <= 15;

  const handleAceitar = async () => {
    setAcao("aceitar");
    await onAceitar();
  };

  const handleRecusar = async () => {
    setAcao("recusar");
    await onRecusar();
  };

  return (
    <div
      className={cn(
        "mx-5 rounded-2xl border-2 border-foreground/20 bg-card p-4 space-y-3",
        intensoUrgente ? "animate-pulse border-destructive/60" : "animate-pulse-subtle"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Corrida chegando
          </span>
          <div className={cn("text-4xl font-bold leading-none mt-1 tabular-nums", corContador)}>
            {restante}s
          </div>
        </div>
        {onAlternarSom && (
          <button
            type="button"
            onClick={onAlternarSom}
            aria-label={silenciado ? "Ativar som" : "Silenciar"}
            className="shrink-0 w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors"
          >
            {silenciado ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
          <p className="text-sm text-foreground line-clamp-1">{dispatch.origem_endereco}</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-1 w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
          <p className="text-sm text-foreground line-clamp-1">{dispatch.destino_endereco}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {dispatch.distancia_km.toFixed(1)}km
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {dispatch.duracao_min}min
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          R${dispatch.valor.toFixed(2).replace(".", ",")}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link className="w-3 h-3" />
        <span>{dispatch.origem_nome}</span>
      </div>

      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000 ease-linear rounded-full", corBarra)}
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleRecusar} disabled={desabilitado} className="flex-1 h-11">
          {acao === "recusar" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recusar"}
        </Button>
        <Button onClick={handleAceitar} disabled={desabilitado} className="flex-1 h-11 font-semibold">
          {acao === "aceitar" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aceitar"}
        </Button>
      </div>
    </div>
  );
}
