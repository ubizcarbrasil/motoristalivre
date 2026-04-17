import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Retorna o slug do tenant do admin logado e se ele é dono (owner) do tenant.
 */
export function useTenantAdmin() {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [ehDono, setEhDono] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      const { data: sessao } = await supabase.auth.getSession();
      const userId = sessao.session?.user.id;
      if (!userId) {
        if (ativo) setCarregando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", userId)
        .maybeSingle();

      if (!usuario?.tenant_id) {
        if (ativo) setCarregando(false);
        return;
      }

      const { data: tenant } = await supabase
        .from("tenants")
        .select("slug, owner_user_id")
        .eq("id", usuario.tenant_id)
        .maybeSingle();

      if (ativo) {
        setTenantSlug(tenant?.slug ?? null);
        setEhDono(tenant?.owner_user_id === userId);
        setCarregando(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  return { tenantSlug, ehDono, carregando };
}
