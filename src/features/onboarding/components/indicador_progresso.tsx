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
  const total = indices.length;
  const progresso = ((indiceAtual + 1) / total) * 100;
  const rotuloAtual = ETAPAS[indices[indiceAtual] ?? 0];

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      {/* Mobile: barra compacta + contador */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">{rotuloAtual}</span>
          <span className="text-muted-foreground tabular-nums">
            Etapa {indiceAtual + 1} de {total}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Desktop: stepper completo */}
      <div className="hidden md:flex items-center justify-between">
        {indices.map((idxEtapa, indice) => {
          const ativo = indice <= indiceAtual;
          const atual = indice === indiceAtual;
          const rotulo = ETAPAS[idxEtapa];
          return (
            <div key={idxEtapa} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {indice > 0 && (
                  <div className={`h-[2px] flex-1 transition-colors duration-300 ${indice <= indiceAtual ? "bg-primary" : "bg-border"}`} />
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
                  <div className={`h-[2px] flex-1 transition-colors duration-300 ${indice < indiceAtual ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <span className={`text-[11px] mt-2 transition-colors duration-300 ${atual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {rotulo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
