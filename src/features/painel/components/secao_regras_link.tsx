import { useEffect, useState } from "react";
import { Zap, MapPin, Radio } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  buscarRegrasDispatch,
  salvarModoDispatchMotorista,
  salvarTimeoutDispatchTenant,
} from "../services/servico_configuracoes";
import type {
  ConfigRegrasDispatch,
  ModoDispatch,
} from "../types/tipos_configuracoes";

interface SecaoRegrasLinkProps {
  driverId: string;
  tenantId: string;
  ehAdmin: boolean;
}

const MODOS: { id: ModoDispatch; label: string; descricao: string; icone: typeof Zap }[] = [
  {
    id: "auto",
    label: "Prioridade para você",
    descricao: "Você recebe primeiro com countdown. Se não atender, transborda.",
    icone: Zap,
  },
  {
    id: "hybrid",
    label: "Por proximidade",
    descricao: "Quem estiver mais próximo do passageiro recebe primeiro.",
    icone: MapPin,
  },
  {
    id: "manual",
    label: "Para todos ao mesmo tempo",
    descricao: "Broadcast: todos os motoristas online recebem juntos.",
    icone: Radio,
  },
];

export function SecaoRegrasLink({ driverId, tenantId, ehAdmin }: SecaoRegrasLinkProps) {
  const [config, setConfig] = useState<ConfigRegrasDispatch | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarRegrasDispatch(driverId, tenantId, ehAdmin).then(setConfig);
  }, [driverId, tenantId, ehAdmin]);

  if (!config) {
    return <p className="text-xs text-muted-foreground">Carregando regras...</p>;
  }

  const escolherModo = (modo: ModoDispatch) => setConfig({ ...config, modo });
  const setTimeout = (v: number) => setConfig({ ...config, timeout_sec: v });

  const salvar = async () => {
    setSalvando(true);
    try {
      await salvarModoDispatchMotorista(driverId, config.modo);
      if (config.pode_editar) {
        await salvarTimeoutDispatchTenant(tenantId, config.timeout_sec);
      }
      toast.success("Regras salvas");
    } catch {
      toast.error("Erro ao salvar regras");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Regras do meu link</h3>
        <p className="text-[11px] text-muted-foreground">
          Como as corridas do seu link são despachadas.
        </p>
      </div>

      <div className="space-y-2">
        {MODOS.map(({ id, label, descricao, icone: Icone }) => {
          const ativo = config.modo === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => escolherModo(id)}
              className={`w-full text-left rounded-xl border p-3 flex items-start gap-3 transition-colors ${
                ativo
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  ativo ? "bg-primary/15" : "bg-secondary"
                }`}
              >
                <Icone className={`w-4 h-4 ${ativo ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${ativo ? "text-primary" : "text-foreground"}`}>
                  {label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  {descricao}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Tempo antes do transbordo</Label>
          <span className="text-sm font-semibold text-foreground">{config.timeout_sec}s</span>
        </div>
        <Slider
          value={[config.timeout_sec]}
          onValueChange={([v]) => setTimeout(v)}
          min={10}
          max={120}
          step={1}
          disabled={!config.pode_editar}
        />
        {!config.pode_editar && (
          <p className="text-[10px] text-muted-foreground">
            Apenas o admin do grupo pode alterar este tempo.
          </p>
        )}
      </div>

      <Button onClick={salvar} disabled={salvando} className="w-full h-11">
        {salvando ? "Salvando..." : "Salvar regras"}
      </Button>
    </div>
  );
}
