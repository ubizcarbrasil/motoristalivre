import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";

type Destino = string;

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
        .select("role, tenant_id")
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
          // Afiliado e motorista compartilham o mesmo painel unificado
          setDestino("/painel");
          break;
        case "passenger": {
          // Busca tenant + um motorista para montar /{slug}/{driver_slug}
          if (data?.tenant_id) {
            const { data: tenant } = await supabase
              .from("tenants")
              .select("slug")
              .eq("id", data.tenant_id)
              .maybeSingle();
            const { data: driver } = await supabase
              .from("drivers")
              .select("slug")
              .eq("tenant_id", data.tenant_id)
              .order("is_online", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (tenant?.slug && driver?.slug) {
              setDestino(`/${tenant.slug}/${driver.slug}`);
            } else if (tenant?.slug) {
              setDestino(`/${tenant.slug}`);
            } else {
              setDestino("/painel");
            }
          } else {
            setDestino("/painel");
          }
          break;
        }
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
