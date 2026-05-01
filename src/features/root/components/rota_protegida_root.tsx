import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

interface RotaProtegidaRootProps {
  children: ReactNode;
}

export function RotaProtegidaRoot({ children }: RotaProtegidaRootProps) {
  const { usuario, carregando } = useAutenticacao();
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (carregando) return;
    if (!usuario) {
      setVerificando(false);
      return;
    }
    let ativo = true;
    (async () => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", usuario.id)
        .maybeSingle();
      if (!ativo) return;
      setAutorizado(data?.role === "root_admin");
      setVerificando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [usuario, carregando]);

  if (carregando || verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  if (!autorizado) {
    return <Navigate to="/painel" replace />;
  }

  return <>{children}</>;
}
