import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";

type Destino = "/admin" | "/painel" | "/afiliado" | "/root" | "/onboarding";

export function useRedirecionamento(): { destino: Destino | null; carregando: boolean } {
  const { usuario, carregando: carregandoAuth, temTenant } = useAutenticacao();
  const [destino, setDestino] = useState<Destino | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (carregandoAuth) return;

    if (!usuario) {
      setCarregando(false);
      return;
    }

    if (temTenant === null) return; // ainda verificando

    if (temTenant === false) {
      setDestino("/onboarding");
      setCarregando(false);
      return;
    }

    async function buscarRole() {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", usuario!.id)
        .single();

      const role = data?.role;

      switch (role) {
        case "root_admin":
          setDestino("/root");
          break;
        case "tenant_admin":
        case "manager":
          setDestino("/admin");
          break;
        case "affiliate":
          setDestino("/afiliado");
          break;
        case "driver":
        default:
          setDestino("/painel");
          break;
      }
      setCarregando(false);
    }

    buscarRole();
  }, [usuario, carregandoAuth, temTenant]);

  return { destino, carregando };
}
