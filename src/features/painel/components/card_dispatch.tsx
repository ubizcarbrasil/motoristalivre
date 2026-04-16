import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Link } from "lucide-react";
import type { DispatchAtivo } from "../types/tipos_painel";
import { TIMEOUT_DISPATCH_SEG } from "../constants/constantes_painel";

interface CardDispatchProps {
  dispatch: DispatchAtivo;
  onAceitar: () => void;
  onRecusar: () => void;
}

export function CardDispatch({ dispatch, onAceitar, onRecusar }: CardDispatchProps) {
  const [restante, setRestante] = useState(TIMEOUT_DISPATCH_SEG);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - new Date(dispatch.dispatched_at).getTime()) / 1000);
    const inicial = Math.max(0, TIMEOUT_DISPATCH_SEG - elapsed);
    setRestante(inicial);

    const timer = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch.dispatched_at]);

  const progresso = (restante / TIMEOUT_DISPATCH_SEG) * 100;

  return (
    <div className="mx-5 rounded-2xl border-2 border-foreground/20 bg-card p-4 space-y-3 animate-pulse-subtle">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Corrida chegando</span>
        <span className="text-xs text-muted-foreground">{restante}s</span>
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

      {/* Barra de countdown */}
      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRecusar} className="flex-1 h-11">
          Recusar
        </Button>
        <Button onClick={onAceitar} className="flex-1 h-11 font-semibold">
          Aceitar
        </Button>
      </div>
    </div>
  );
}
