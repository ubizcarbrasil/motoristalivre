import { Check, Copy, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MotoristaOpcao } from "../types/tipos_simulador";

interface Props {
  motoristas: MotoristaOpcao[];
  motoristaIdSelecionado: string;
  onSelecionar: (id: string) => void;
  idsConectadosRealtime: Set<string>;
}

export function ListaMotoristasSimulador({
  motoristas,
  motoristaIdSelecionado,
  onSelecionar,
  idsConectadosRealtime,
}: Props) {
  const [idCopiado, setIdCopiado] = useState<string | null>(null);

  const copiarId = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setIdCopiado(id);
      toast.success("ID copiado");
      setTimeout(() => setIdCopiado(null), 1500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  if (!motoristas.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
        Nenhum motorista neste grupo.
      </div>
    );
  }

  const online = motoristas.filter((m) => m.is_online);
  const offline = motoristas.filter((m) => !m.is_online);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Motoristas do grupo</h2>
        <span className="text-xs text-muted-foreground">
          {online.length} online · {idsConectadosRealtime.size} no painel agora
        </span>
      </div>

      <div className="space-y-2">
        {[...online, ...offline].map((m) => {
          const conectado = idsConectadosRealtime.has(m.id);
          const selecionado = m.id === motoristaIdSelecionado;
          const idCurto = m.id.slice(0, 8);

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelecionar(m.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                selecionado
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-muted/40"
              )}
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  m.is_online ? "bg-primary" : "bg-muted-foreground/40"
                )}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{m.nome}</span>
                  {conectado ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Wifi className="w-3 h-3" />
                      ao vivo
                    </span>
                  ) : m.is_online ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <WifiOff className="w-3 h-3" />
                      sem painel
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-[11px] font-mono text-muted-foreground">
                    {idCurto}
                  </code>
                  <button
                    type="button"
                    onClick={(e) => copiarId(e, m.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copiar ID completo"
                  >
                    {idCopiado === m.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {selecionado && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-primary shrink-0">
                  Alvo
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        <span className="text-primary font-medium">Ao vivo</span> = motorista com{" "}
        <code>/painel</code> aberto agora (realtime conectado). É quem deve receber
        o card e o som imediatamente.
      </p>
    </div>
  );
}
