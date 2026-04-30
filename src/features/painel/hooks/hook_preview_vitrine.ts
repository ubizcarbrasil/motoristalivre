import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listarPortfolioPorMotorista,
  listarEquipeDoMotorista,
} from "@/features/motorista/services/servico_vitrine";
import type { ItemPortfolio, MembroEquipe } from "@/features/motorista/types/tipos_vitrine";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";

interface DadosPreview {
  driverId: string;
  nome: string;
  avatar_url: string | null;
  bio: string | null;
  cover_url: string | null;
  slug: string;
  is_verified: boolean;
  credential_verified: boolean;
  service_categories: string[];
  professional_type: "driver" | "service_provider" | "both";
  tenant_slug: string;
  tenant_nome: string;
}

export interface RetornoPreviewVitrine {
  dados: DadosPreview | null;
  servicos: TipoServico[];
  portfolio: ItemPortfolio[];
  equipe: MembroEquipe[];
  carregando: boolean;
  recarregar: () => Promise<void>;
}

export function useHookPreviewVitrine(driverId: string, ativo: boolean): RetornoPreviewVitrine {
  const [dados, setDados] = useState<DadosPreview | null>(null);
  const [servicos, setServicos] = useState<TipoServico[]>([]);
  const [portfolio, setPortfolio] = useState<ItemPortfolio[]>([]);
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { data: driver } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", driverId)
        .maybeSingle();

      if (!driver) {
        setDados(null);
        return;
      }

      const [{ data: user }, { data: tenant }] = await Promise.all([
        supabase.from("users").select("full_name, avatar_url").eq("id", driverId).maybeSingle(),
        supabase.from("tenants").select("name, slug").eq("id", driver.tenant_id).maybeSingle(),
      ]);

      setDados({
        driverId,
        nome: user?.full_name ?? "Profissional",
        avatar_url: user?.avatar_url ?? null,
        bio: driver.bio,
        cover_url: driver.cover_url,
        slug: driver.slug,
        is_verified: driver.is_verified,
        credential_verified: !!(driver as any).credential_verified,
        service_categories: ((driver as any).service_categories as string[]) ?? [],
        professional_type:
          ((driver as any).professional_type as DadosPreview["professional_type"]) ?? "driver",
        tenant_slug: tenant?.slug ?? "",
        tenant_nome: tenant?.name ?? "",
      });

      const [{ data: servs }, itens, membros] = await Promise.all([
        supabase
          .from("service_types" as any)
          .select("*")
          .eq("driver_id", driverId)
          .eq("is_active", true)
          .order("created_at", { ascending: true }),
        listarPortfolioPorMotorista(driverId),
        listarEquipeDoMotorista(driverId),
      ]);

      setServicos((servs ?? []) as unknown as TipoServico[]);
      setPortfolio(itens);
      setEquipe(membros);
    } finally {
      setCarregando(false);
    }
  }, [driverId]);

  useEffect(() => {
    if (!ativo || !driverId) return;
    recarregar();

    const canal = supabase
      .channel(`preview_vitrine_${driverId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_portfolio_items", filter: `driver_id=eq.${driverId}` },
        () => recarregar(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "professional_team_members", filter: `owner_driver_id=eq.${driverId}` },
        () => recarregar(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers", filter: `id=eq.${driverId}` },
        () => recarregar(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [ativo, driverId, recarregar]);

  return { dados, servicos, portfolio, equipe, carregando, recarregar };
}
