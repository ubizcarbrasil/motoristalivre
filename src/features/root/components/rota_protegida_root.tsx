import { Navigate } from "react-router-dom";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import type { ReactNode } from "react";

interface RotaProtegidaRootProps {
  children: ReactNode;
}

export function RotaProtegidaRoot({ children }: RotaProtegidaRootProps) {
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

  // Role check is done via RLS — if the user is not root_admin,
  // all queries will return empty results, effectively blocking access.
  return <>{children}</>;
}
