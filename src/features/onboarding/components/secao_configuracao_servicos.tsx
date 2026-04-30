import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardServicoOnboarding } from "./card_servico_onboarding";
import { SERVICO_INICIAL } from "../constants/constantes_onboarding";
import type { DadosServico } from "../types/tipos_onboarding";

interface SecaoConfiguracaoServicosProps {
  servicos: DadosServico[];
  onChange: (servicos: DadosServico[]) => void;
}

export function SecaoConfiguracaoServicos({ servicos, onChange }: SecaoConfiguracaoServicosProps) {
  const adicionar = () => {
    const novo: DadosServico = {
      ...SERVICO_INICIAL,
      id: crypto.randomUUID(),
    };
    onChange([...servicos, novo]);
  };

  const atualizar = (id: string, atualizado: DadosServico) => {
    onChange(servicos.map((s) => (s.id === id ? atualizado : s)));
  };

  const remover = (id: string) => {
    onChange(servicos.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Seus serviços</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Cadastre os serviços que você oferece. Cada um pode ser cobrado por valor fixo, hora ou
          diária. Você pode editar, adicionar mais ou remover depois.
        </p>
      </div>

      {servicos.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum serviço cadastrado ainda.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Adicione pelo menos um para continuar.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {servicos.map((s) => (
          <CardServicoOnboarding
            key={s.id}
            servico={s}
            onChange={(atualizado) => atualizar(s.id, atualizado)}
            onRemover={() => remover(s.id)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={adicionar}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Adicionar serviço
      </Button>
    </div>
  );
}
