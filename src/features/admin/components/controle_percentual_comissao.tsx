import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Percent } from "lucide-react";

interface Props {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  onChange: (valor: number) => void;
  desabilitado?: boolean;
  max?: number;
}

export function ControlePercentualComissao({
  id,
  titulo,
  descricao,
  valor,
  onChange,
  desabilitado,
  max = 100,
}: Props) {
  const valorSeguro = Number.isFinite(valor) ? valor : 0;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium text-foreground">
            {titulo}
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">{descricao}</p>
        </div>
        <div className="relative shrink-0">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            max={max}
            step="0.5"
            value={valorSeguro}
            disabled={desabilitado}
            onChange={(evento) => {
              const novo = Number(evento.target.value);
              if (Number.isNaN(novo)) return;
              onChange(Math.min(max, Math.max(0, novo)));
            }}
            className="w-24 pr-8 text-right font-semibold"
          />
          <Percent className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <Slider
        value={[valorSeguro]}
        onValueChange={(novo) => onChange(novo[0] ?? 0)}
        min={0}
        max={max}
        step={0.5}
        disabled={desabilitado}
      />
    </div>
  );
}
