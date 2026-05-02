import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugValido } from "@/compartilhados/constants/constantes_categorias_servico";

/**
 * Identifica se o profissional ainda precisa concluir o onboarding antes de
 * acessar categorias, portfólio e equipe da vitrine pública.
 */
export interface DadosOnboardingProfissional {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  cover_url: string | null;
  professional_type: string | null;
  service_categories: string[];
  cidade: string | null;
}

export type CampoOnboarding =
  | "full_name"
  | "phone"
  | "professional_type"
  | "service_categories"
  | "bio"
  | "avatar_url"
  | "cover_url"
  | "cidade";

const CAMPOS_OBRIGATORIOS: CampoOnboarding[] = [
  "full_name",
  "phone",
  "professional_type",
  "service_categories",
  "bio",
  "avatar_url",
  "cover_url",
  "cidade",
];

interface RetornoHook {
  carregando: boolean;
  dados: DadosOnboardingProfissional | null;
  camposFaltantes: CampoOnboarding[];
  precisaOnboarding: boolean;
  recarregar: () => Promise<void>;
}

export function useHookOnboardingProfissional(
  driverId: string,
  tenantId: string,
): RetornoHook {
  const [dados, setDados] = useState<DadosOnboardingProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [{ data: driver }, { data: user }, { data: branding }] = await Promise.all([
        supabase
          .from("drivers")
          .select("bio, cover_url, professional_type, service_categories")
          .eq("id", driverId)
          .maybeSingle(),
        supabase
          .from("users")
          .select("full_name, avatar_url, phone")
          .eq("id", driverId)
          .maybeSingle(),
        supabase
          .from("tenant_branding")
          .select("city")
          .eq("tenant_id", tenantId)
          .maybeSingle(),
      ]);

      const driverRow = driver as unknown as {
        bio: string | null;
        cover_url: string | null;
        professional_type: string | null;
        service_categories: string[] | null;
      } | null;

      const categoriasSaneadas = (driverRow?.service_categories ?? []).filter((slug) =>
        slugValido(slug),
      );

      console.log("[onboarding] versão sanitização v3", {
        categoriasOriginais: driverRow?.service_categories ?? [],
        categoriasSaneadas,
      });

      setDados({
        full_name: user?.full_name ?? null,
        phone: user?.phone ?? null,
        avatar_url: user?.avatar_url ?? null,
        bio: driverRow?.bio ?? null,
        cover_url: driverRow?.cover_url ?? null,
        professional_type: driverRow?.professional_type ?? null,
        service_categories: categoriasSaneadas,
        cidade: branding?.city ?? null,
      });
    } finally {
      setCarregando(false);
    }
  }, [driverId, tenantId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const camposFaltantes = calcularCamposFaltantes(dados);

  return {
    carregando,
    dados,
    camposFaltantes,
    precisaOnboarding: camposFaltantes.length > 0,
    recarregar: carregar,
  };
}

function calcularCamposFaltantes(
  dados: DadosOnboardingProfissional | null,
): CampoOnboarding[] {
  if (!dados) return [];
  const faltantes: CampoOnboarding[] = [];

  for (const campo of CAMPOS_OBRIGATORIOS) {
    const valor = dados[campo];
    if (valor === null || valor === undefined) {
      faltantes.push(campo);
      continue;
    }
    if (typeof valor === "string" && valor.trim().length === 0) {
      faltantes.push(campo);
      continue;
    }
    if (Array.isArray(valor) && valor.length === 0) {
      faltantes.push(campo);
    }
  }

  return faltantes;
}
