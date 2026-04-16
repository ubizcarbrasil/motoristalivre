import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  buscarConfigPreco,
  salvarConfigPreco,
} from "../services/servico_configuracoes";
import type { ConfigPrecoMotorista } from "../types/tipos_configuracoes";

interface SecaoMeuPrecoProps {
  driverId: string;
  tenantId: string;
}

export function SecaoMeuPreco({ driverId, tenantId }: SecaoMeuPrecoProps) {
  const [config, setConfig] = useState<ConfigPrecoMotorista | null>(null);
  const [aceitarOfertas, setAceitarOfertas] = useState(false);
  const [ofertaMin, setOfertaMin] = useState(80);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarConfigPreco(driverId, tenantId).then(setConfig);
  }, [driverId, tenantId]);

  if (!config) {
    return <p className="text-xs text-muted-foreground">Carregando preços...</p>;
  }

  const update = <K extends keyof ConfigPrecoMotorista>(k: K, v: ConfigPrecoMotorista[K]) =>
    setConfig({ ...config, [k]: v });

  const salvar = async () => {
    setSalvando(true);
    try {
      await salvarConfigPreco(driverId, {
        base_fare: config.base_fare,
        price_per_km: config.price_per_km,
        price_per_min: config.price_per_min,
        cashback_pct: config.cashback_pct,
      });
      toast.success("Preços atualizados");
    } catch {
      toast.error("Erro ao salvar preços");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Meu preço</h3>
        <p className="text-[11px] text-muted-foreground">
          Aplicado quando o cliente acessa seu link direto.
        </p>
      </div>

      {!config.permitido && (
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-[11px] text-muted-foreground">
            Preços personalizados desativados pelo admin do grupo. Valores abaixo são os
            padrões aplicados.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <CampoSlider
          label="Bandeira"
          unidade="R$"
          valor={config.base_fare}
          min={0}
          max={20}
          step={0.5}
          disabled={!config.permitido}
          onChange={(v) => update("base_fare", v)}
        />
        <CampoSlider
          label="Preço por km"
          unidade="R$"
          valor={config.price_per_km}
          min={0.5}
          max={10}
          step={0.1}
          disabled={!config.permitido}
          onChange={(v) => update("price_per_km", v)}
        />
        <CampoSlider
          label="Preço por minuto"
          unidade="R$"
          valor={config.price_per_min}
          min={0.1}
          max={5}
          step={0.1}
          disabled={!config.permitido}
          onChange={(v) => update("price_per_min", v)}
        />
        <CampoSlider
          label="Cashback para passageiro"
          unidade="%"
          valor={config.cashback_pct}
          min={0}
          max={30}
          step={1}
          disabled={!config.permitido}
          onChange={(v) => update("cashback_pct", v)}
        />
      </div>

      <div className="rounded-xl bg-card border border-border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Aceitar ofertas dos clientes</Label>
            <p className="text-[10px] text-muted-foreground">
              Cliente pode oferecer um valor menor que o sugerido.
            </p>
          </div>
          <Switch checked={aceitarOfertas} onCheckedChange={setAceitarOfertas} />
        </div>

        {aceitarOfertas && (
          <CampoSlider
            label="Oferta mínima aceita"
            unidade="%"
            valor={ofertaMin}
            min={60}
            max={100}
            step={5}
            disabled={false}
            onChange={setOfertaMin}
          />
        )}
      </div>

      {config.permitido && (
        <Button onClick={salvar} disabled={salvando} className="w-full h-11">
          {salvando ? "Salvando..." : "Salvar preços"}
        </Button>
      )}
    </div>
  );
}

interface CampoSliderProps {
  label: string;
  unidade: string;
  valor: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (v: number) => void;
}

function CampoSlider({ label, unidade, valor, min, max, step, disabled, onChange }: CampoSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-semibold text-foreground">
          {unidade === "R$"
            ? `R$ ${valor.toFixed(2).replace(".", ",")}`
            : `${valor}${unidade}`}
        </span>
      </div>
      <Slider
        value={[valor]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}
