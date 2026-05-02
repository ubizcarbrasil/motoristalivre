import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  comissao_cobertura_pct: number;
  comissao_indicacao_pct: number;
  comissao_fixa_brl: number;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function SimuladorRepasse({
  comissao_cobertura_pct,
  comissao_indicacao_pct,
  comissao_fixa_brl,
}: Props) {
  const [valor, setValor] = useState<number>(200);
  const [coberturaAtiva, setCoberturaAtiva] = useState(true);

  const resultado = useMemo(() => {
    const pct = coberturaAtiva ? comissao_cobertura_pct : comissao_indicacao_pct;
    const fixa = coberturaAtiva && comissao_fixa_brl > 0 ? comissao_fixa_brl : 0;
    const comissao = fixa > 0 ? fixa : Math.round(((valor * pct) / 100) * 100) / 100;
    const liquido = Math.max(0, valor - comissao);
    return { comissao, liquido, modo: fixa > 0 ? "fixa" : "percentual" as const };
  }, [valor, coberturaAtiva, comissao_cobertura_pct, comissao_indicacao_pct, comissao_fixa_brl]);

  return (
    <div className="rounded-lg border border-border bg-card/40 p-3 space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <Calculator className="h-3.5 w-3.5 text-primary" />
        Simulador de repasse
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">Valor do serviço (R$)</Label>
          <Input
            type="number"
            min={0}
            step={10}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Tipo</Label>
          <div className="flex items-center gap-2 h-8">
            <Switch checked={coberturaAtiva} onCheckedChange={setCoberturaAtiva} />
            <span className="text-xs text-muted-foreground">
              {coberturaAtiva ? "Cobertura" : "Indicação"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Repasse {resultado.modo === "fixa" ? "(fixo)" : "(%)"}
          </p>
          <p className="text-sm font-semibold text-primary">{brl(resultado.comissao)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Líquido para atendente
          </p>
          <p className="text-sm font-semibold text-foreground">{brl(resultado.liquido)}</p>
        </div>
      </div>
    </div>
  );
}
