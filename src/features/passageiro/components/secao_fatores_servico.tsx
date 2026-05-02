import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sliders } from "lucide-react";
import type { FatorPrecoServico } from "@/features/servicos/utils/calculadora_preco_servico";

interface Props {
  fatores: FatorPrecoServico[];
  valores: Record<string, string | number | undefined>;
  onChange: (proximos: Record<string, string | number | undefined>) => void;
}

export function SecaoFatoresServico({ fatores, valores, onChange }: Props) {
  if (!fatores || fatores.length === 0) return null;

  const atualizar = (chave: string, valor: string | number | undefined) => {
    onChange({ ...valores, [chave]: valor });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/50 p-3">
      <div className="flex items-center gap-2">
        <Sliders className="w-4 h-4 text-primary" />
        <div>
          <p className="text-xs font-medium text-foreground">Detalhes do serviço</p>
          <p className="text-[11px] text-muted-foreground">
            Esses dados ajustam o valor final.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {fatores.map((f) => {
          const id = `fator_${f.key}`;
          if (f.input_type === "select" && f.options) {
            return (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={id} className="text-xs text-foreground">
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                <Select
                  value={(valores[f.key] as string) ?? ""}
                  onValueChange={(v) => atualizar(f.key, v)}
                >
                  <SelectTrigger id={id} className="h-9 text-xs">
                    <SelectValue placeholder="Selecione…" />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((op) => (
                      <SelectItem key={op.valor} value={op.valor} className="text-xs">
                        {op.rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          return (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={id} className="text-xs text-foreground">
                {f.label}
                {f.required && <span className="text-destructive"> *</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={id}
                  type="number"
                  inputMode="numeric"
                  min={f.min_value ?? undefined}
                  max={f.max_value ?? undefined}
                  step={f.step ?? 1}
                  value={
                    valores[f.key] === undefined || valores[f.key] === ""
                      ? ""
                      : String(valores[f.key])
                  }
                  onChange={(e) =>
                    atualizar(f.key, e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  placeholder={
                    f.default_value !== null && f.default_value !== undefined
                      ? String(f.default_value)
                      : ""
                  }
                  className="h-9 text-xs flex-1"
                />
                {f.unit && (
                  <span className="text-[11px] text-muted-foreground shrink-0">{f.unit}</span>
                )}
              </div>
              {f.unit_price > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  R$ {Number(f.unit_price).toFixed(2)} por {f.unit ?? "unidade"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
