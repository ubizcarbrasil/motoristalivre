import { ETAPAS } from "../constants/constantes_onboarding";
import type { EtapaOnboarding } from "../types/tipos_onboarding";

interface IndicadorProgressoProps {
  etapaAtual: EtapaOnboarding;
  etapasHabilitadas?: EtapaOnboarding[];
}

export function IndicadorProgresso({
  etapaAtual,
  etapasHabilitadas,
}: IndicadorProgressoProps) {
  const indices = etapasHabilitadas ?? ([0, 1, 2, 3, 4, 5] as EtapaOnboarding[]);
  const indiceAtual = indices.indexOf(etapaAtual);

  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      <div className="flex items-center justify-between">
        {indices.map((idxEtapa, indice) => {
          const ativo = indice <= indiceAtual;
          const atual = indice === indiceAtual;
          const rotulo = ETAPAS[idxEtapa];

          return (
            <div key={idxEtapa} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {indice > 0 && (
                  <div
                    className={`h-[2px] flex-1 transition-colors duration-300 ${
                      indice <= indiceAtual ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 shrink-0 ${
                    atual
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                      : ativo
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {indice + 1}
                </div>
                {indice < indices.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 transition-colors duration-300 ${
                      indice < indiceAtual ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[11px] mt-2 transition-colors duration-300 ${
                  atual ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {rotulo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
