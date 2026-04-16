import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface RotaProtegidaProps {
  children: ReactNode;
}

export function RotaProtegida({ children }: RotaProtegidaProps) {
  const { usuario, carregando, temTenant } = useAutenticacao();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  // Se o user nao tem tenant e nao esta no onboarding, redirecionar
  if (temTenant === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
