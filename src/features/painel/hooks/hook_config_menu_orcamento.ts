import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ConfigMenuOrcamento {
  enabled: boolean;
  label: string;
  icon: string;
  color: string | null;
}

const PADRAO: ConfigMenuOrcamento = {
  enabled: true,
  label: "Orçamento",
  icon: "FileText",
  color: null,
};

/**
 * Carrega a configuração do item de menu "Orçamento" da tribo.
 * Usa slug do tenant para localizar e cachear por slug em memória.
 */
const cacheBySlug = new Map<string, ConfigMenuOrcamento>();

export function useConfigMenuOrcamento(tenantSlug: string | null | undefined) {
  const [config, setConfig] = useState<ConfigMenuOrcamento>(() =>
    tenantSlug && cacheBySlug.has(tenantSlug) ? cacheBySlug.get(tenantSlug)! : PADRAO,
  );

  useEffect(() => {
    if (!tenantSlug) return;
    if (cacheBySlug.has(tenantSlug)) {
      setConfig(cacheBySlug.get(tenantSlug)!);
      return;
    }

    let cancelado = false;
    (async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .maybeSingle();
      if (!tenant?.id || cancelado) return;

      const { data } = await supabase
        .from("tenant_settings")
        .select("quote_menu_enabled, quote_menu_label, quote_menu_icon, quote_menu_color")
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (cancelado) return;

      const resolvido: ConfigMenuOrcamento = {
        enabled: data?.quote_menu_enabled ?? PADRAO.enabled,
        label: data?.quote_menu_label?.trim() || PADRAO.label,
        icon: data?.quote_menu_icon?.trim() || PADRAO.icon,
        color: data?.quote_menu_color?.trim() || null,
      };
      cacheBySlug.set(tenantSlug, resolvido);
      setConfig(resolvido);
    })();

    return () => {
      cancelado = true;
    };
  }, [tenantSlug]);

  return config;
}
