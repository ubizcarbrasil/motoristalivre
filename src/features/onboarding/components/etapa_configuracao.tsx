import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { MODOS_DESPACHO } from "../constants/constantes_onboarding";
import type { DadosConfiguracao } from "../types/tipos_onboarding";

interface EtapaConfiguracaoProps {
  dados: DadosConfiguracao;
  onChange: (dados: DadosConfiguracao) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}

export function EtapaConfiguracao({ dados, onChange, onAvancar, onVoltar }: EtapaConfiguracaoProps) {
  const atualizar = <K extends keyof DadosConfiguracao>(campo: K, valor: DadosConfiguracao[K]) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuração inicial</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Defina como as corridas serão distribuídas e precificadas.
        </p>
      </div>

      {/* Modo de despacho */}
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

      {/* Preços */}
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

        <div className="space-y-2">
          <Label htmlFor="comissao">Comissão de transbordo (%)</Label>
          <Input
            id="comissao"
            type="number"
            min={0}
            max={50}
            value={dados.comissaoTransbordo}
            onChange={(e) => atualizar("comissaoTransbordo", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashback">Cashback padrão (%)</Label>
          <Input
            id="cashback"
            type="number"
            min={0}
            max={30}
            value={dados.cashbackPadrao}
            onChange={(e) => atualizar("cashbackPadrao", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} className="flex-1">
          Voltar
        </Button>
        <Button onClick={onAvancar} className="flex-1">
          Continuar
        </Button>
      </div>
    </div>
  );
}
