import { Navigate } from "react-router-dom";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import type { ReactNode } from "react";

interface RotaProtegidaProps {
  children: ReactNode;
}

export function RotaProtegida({ children }: RotaProtegidaProps) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  return <>{children}</>;
}
