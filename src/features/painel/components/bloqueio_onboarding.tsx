import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BloqueioOnboardingProps {
  titulo: string;
  descricao?: string;
  onAbrir: () => void;
}

/**
 * Substitui visualmente seções sensíveis (categorias, portfólio, equipe)
 * enquanto o profissional não conclui o onboarding obrigatório.
 */
export function BloqueioOnboarding({
  titulo,
  descricao,
  onAbrir,
}: BloqueioOnboardingProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-5 space-y-3 text-center">
      <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center mx-auto">
        <Lock className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{titulo}</p>
        <p className="text-[12px] text-muted-foreground">
          {descricao ??
            "Conclua seu cadastro profissional para liberar esta seção."}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onAbrir} className="h-9">
        Completar cadastro
      </Button>
    </div>
  );
}
