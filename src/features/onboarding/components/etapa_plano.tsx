import { Button } from "@/components/ui/button";
import { PLANOS } from "../constants/constantes_onboarding";
import { Check } from "lucide-react";

interface EtapaPlanoProps {
  planoSelecionado: string;
  onSelecionar: (id: string) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}

export function EtapaPlano({ planoSelecionado, onSelecionar, onAvancar, onVoltar }: EtapaPlanoProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Escolha seu plano</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o plano ideal para o tamanho do seu grupo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANOS.map((plano) => {
          const selecionado = plano.id === planoSelecionado;

          return (
            <button
              key={plano.id}
              type="button"
              onClick={() => onSelecionar(plano.id)}
              className={`relative rounded-xl border p-5 text-left transition-all duration-200 ${
                selecionado
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recomendado
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">{plano.nome}</h3>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-foreground">
                    R${plano.precoMensal.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </div>

              <ul className="space-y-2">
                {plano.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
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
