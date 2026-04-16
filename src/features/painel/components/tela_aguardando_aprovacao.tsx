import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/compartilhados/hooks/hook_logout";

interface TelaAguardandoAprovacaoProps {
  nomeGrupo: string;
}

export function TelaAguardandoAprovacao({ nomeGrupo }: TelaAguardandoAprovacaoProps) {
  const { logout } = useLogout();
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Aguardando aprovação</h1>
          <p className="text-sm text-muted-foreground">
            Sua solicitação para entrar no grupo{" "}
            <strong className="text-foreground">{nomeGrupo}</strong> foi enviada.
            O dono do grupo precisa aprovar antes de você começar a receber corridas.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}
