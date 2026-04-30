import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MODOS_DESPACHO } from "../constants/constantes_onboarding";
import type { DadosConfiguracao } from "../types/tipos_onboarding";

interface SecaoConfiguracaoMobilidadeProps {
  dados: DadosConfiguracao;
  onChange: (dados: DadosConfiguracao) => void;
}

export function SecaoConfiguracaoMobilidade({ dados, onChange }: SecaoConfiguracaoMobilidadeProps) {
  const atualizar = <K extends keyof DadosConfiguracao>(campo: K, valor: DadosConfiguracao[K]) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Mobilidade (corridas)</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Como as corridas serão distribuídas e precificadas.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Modo de despacho</Label>
        <div className="space-y-2">
          {MODOS_DESPACHO.map((modo) => (
            <button
              key={modo.valor}
              type="button"
              onClick={() => atualizar("modoDespacho", modo.valor)}
              className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                dados.modoDespacho === modo.valor
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{modo.titulo}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{modo.descricao}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bandeira (R$)</Label>
            <span className="text-sm font-medium text-foreground">
              R${dados.bandeira.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <Slider
            value={[dados.bandeira]}
            onValueChange={([v]) => atualizar("bandeira", v)}
            min={0}
            max={20}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preço por km (R$)</Label>
            <span className="text-sm font-medium text-foreground">
              R${dados.precoPorKm.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <Slider
            value={[dados.precoPorKm]}
            onValueChange={([v]) => atualizar("precoPorKm", v)}
            min={0.5}
            max={10}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preço por minuto (R$)</Label>
            <span className="text-sm font-medium text-foreground">
              R${dados.precoPorMin.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <Slider
            value={[dados.precoPorMin]}
            onValueChange={([v]) => atualizar("precoPorMin", v)}
            min={0.1}
            max={5}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}
