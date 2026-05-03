import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TriboMotorista } from "../types/tipos_tribos";

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  active_modules: string[] | null;
  signup_slug: string | null;
  service_category_id: string | null;
}

export function useTribosMotorista(userId: string | undefined | null) {
  const [tribos, setTribos] = useState<TriboMotorista[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!userId) {
      setTribos([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);

    const SELECT = "id, name, slug, active_modules, signup_slug, service_category_id";

    const [{ data: donas }, { data: motorista }, { data: membroLinks }] = await Promise.all([
      supabase.from("tenants").select(SELECT).eq("owner_user_id", userId),
      supabase
        .from("drivers")
        .select(`tenant_id, tenants:tenant_id(${SELECT})`)
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("tribe_members" as any)
        .select(`tenant_id, tenants:tenant_id(${SELECT})`)
        .eq("driver_id", userId)
        .eq("is_active", true),
    ]);

    const principalId = motorista?.tenant_id ?? null;
    const mapa = new Map<string, TriboMotorista>();

    const adicionar = (t: TenantRow | null | undefined, papel: "dono" | "membro", principal: boolean) => {
      if (!t?.id) return;
      const existente = mapa.get(t.id);
      const papelFinal: "dono" | "membro" =
        existente?.papel === "dono" || papel === "dono" ? "dono" : "membro";
      mapa.set(t.id, {
        id: t.id,
        nome: t.name,
        slug: t.slug,
        papel: papelFinal,
        ehPrincipal: existente?.ehPrincipal || principal,
        activeModules: t.active_modules ?? ["mobility"],
        signupSlug: t.signup_slug,
        categoriaNome: null,
      });
    };

    const principalTenant = motorista?.tenants as TenantRow | null;
    adicionar(principalTenant, "membro", true);

    (membroLinks as any[] | null)?.forEach((row) => {
      adicionar(row.tenants as TenantRow, "membro", row.tenant_id === principalId);
    });

    (donas as TenantRow[] | null)?.forEach((t) => {
      adicionar(t, "dono", t.id === principalId);
    });

    // Resolve nomes das categorias
    const categoriaIds = Array.from(
      new Set(
        [
          ...((donas ?? []) as TenantRow[]),
          principalTenant,
          ...((membroLinks ?? []).map((r: any) => r.tenants as TenantRow)),
        ]
          .map((t) => t?.service_category_id)
          .filter((v): v is string => !!v),
      ),
    );
    if (categoriaIds.length) {
      const { data: cats } = await supabase
        .from("service_categories")
        .select("id, nome")
        .in("id", categoriaIds);
      const mapaCats = new Map((cats ?? []).map((c) => [c.id, c.nome]));
      const enriquecer = (t: TenantRow | null | undefined) => {
        if (!t?.id) return;
        const tribo = mapa.get(t.id);
        if (tribo && t.service_category_id) {
          tribo.categoriaNome = mapaCats.get(t.service_category_id) ?? null;
        }
      };
      (donas as TenantRow[] | null)?.forEach(enriquecer);
      enriquecer(principalTenant);
      (membroLinks as any[] | null)?.forEach((row) => enriquecer(row.tenants as TenantRow));
    }

    const lista = Array.from(mapa.values()).sort((a, b) => {
      if (a.ehPrincipal && !b.ehPrincipal) return -1;
      if (!a.ehPrincipal && b.ehPrincipal) return 1;
      if (a.papel === "dono" && b.papel !== "dono") return -1;
      if (a.papel !== "dono" && b.papel === "dono") return 1;
      return a.nome.localeCompare(b.nome);
    });

    setTribos(lista);
    setCarregando(false);
  }, [userId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { tribos, carregando, recarregar: carregar };
}
