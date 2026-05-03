import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EstadoVazioTribos() {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">Nenhuma tribo encontrada</h3>
        <p className="text-sm text-muted-foreground">
          Tente ajustar os filtros ou crie sua própria tribo.
        </p>
      </div>
      <Button asChild>
        <Link to="/s/cadastro/tribo">Criar minha tribo</Link>
      </Button>
    </div>
  );
}
