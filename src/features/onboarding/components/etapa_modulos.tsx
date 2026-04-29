import { Car, CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MODULOS_DISPONIVEIS } from "../constants/constantes_onboarding";
import type { ModuloPlataforma } from "../types/tipos_onboarding";
import { cn } from "@/lib/utils";

interface EtapaModulosProps {
  selecionados: ModuloPlataforma[];
  onChange: (modulos: ModuloPlataforma[]) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}

export function EtapaModulos({ selecionados, onChange, onAvancar, onVoltar }: EtapaModulosProps) {
  const alternar = (id: ModuloPlataforma) => {
    if (selecionados.includes(id)) {
      if (selecionados.length === 1) return; // não permitir vazio
      onChange(selecionados.filter((m) => m !== id));
    } else {
      onChange([...selecionados, id]);
    }
  };

  const ambos = selecionados.length === 2;

  const podeAvancar = selecionados.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-foreground">Quais módulos você quer ativar?</h2>
        <p className="text-sm text-muted-foreground">
          Você pode escolher um ou os dois. É possível ativar mais módulos depois.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULOS_DISPONIVEIS.map((modulo) => {
          const ativo = selecionados.includes(modulo.id);
          const Icone = modulo.icone === "car" ? Car : CalendarDays;
          return (
            <button
              type="button"
              key={modulo.id}
              onClick={() => alternar(modulo.id)}
              className={cn(
                "relative text-left rounded-2xl border p-5 transition-all bg-card hover:bg-secondary/40",
                ativo
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icone className="w-5 h-5 text-primary" />
                </div>
                {ativo && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">{modulo.titulo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{modulo.descricao}</p>
            </button>
          );
        })}
      </div>

      {ambos && (
        <div className="flex justify-center">
          <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
            Plataforma completa — 25% de desconto
          </Badge>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-11" onClick={onVoltar}>
          Voltar
        </Button>
        <Button className="flex-1 h-11" onClick={onAvancar} disabled={!podeAvancar}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
