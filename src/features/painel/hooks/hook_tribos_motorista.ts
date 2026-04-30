import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TriboMotorista } from "../types/tipos_tribos";

/**
 * Lista todas as tribos do usuário logado:
 * - tribos onde é dono (tenants.owner_user_id = userId)
 * - tribo principal onde dirige (drivers.tenant_id)
 *
 * Retorna lista unificada (sem duplicatas) com papel + slug + nome.
 */
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

    const [{ data: donas }, { data: motorista }] = await Promise.all([
      supabase
        .from("tenants")
        .select("id, name, slug, active_modules")
        .eq("owner_user_id", userId),
      supabase
        .from("drivers")
        .select("tenant_id, tenants:tenant_id(id, name, slug, active_modules)")
        .eq("id", userId)
        .maybeSingle(),
    ]);

    const principalId = motorista?.tenant_id ?? null;
    const mapa = new Map<string, TriboMotorista>();

    // Tribo principal (membro/dirige)
    const tribuPrincipal = motorista?.tenants as
      | { id: string; name: string; slug: string; active_modules?: string[] }
      | null;
    if (tribuPrincipal) {
      mapa.set(tribuPrincipal.id, {
        id: tribuPrincipal.id,
        nome: tribuPrincipal.name,
        slug: tribuPrincipal.slug,
        papel: "membro",
        ehPrincipal: true,
        modulosAtivos: tribuPrincipal.active_modules ?? [],
      });
    }

    // Tribos onde é dono (sobrescreve papel se já estiver no mapa)
    (donas ?? []).forEach((t) => {
      const existente = mapa.get(t.id);
      mapa.set(t.id, {
        id: t.id,
        nome: t.name,
        slug: t.slug,
        papel: "dono",
        ehPrincipal: existente?.ehPrincipal ?? t.id === principalId,
        modulosAtivos: (t as { active_modules?: string[] }).active_modules ?? [],
      });
    });

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
