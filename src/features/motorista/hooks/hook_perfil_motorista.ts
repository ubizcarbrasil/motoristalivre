import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type {
  PerfilPublicoMotorista,
  MetricasMotorista,
  DistribuicaoNotas,
  AvaliacaoPublica,
} from "../types/tipos_perfil_motorista";
import type {
  TipoServico,
  DisponibilidadeProfissional,
} from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio, MembroEquipe } from "../types/tipos_vitrine";
import {
  listarPortfolioPorMotorista,
  listarEquipeDoMotorista,
} from "../services/servico_vitrine";

export function usePerfilMotorista() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  const [perfil, setPerfil] = useState<PerfilPublicoMotorista | null>(null);
  const [metricas, setMetricas] = useState<MetricasMotorista>({
    nota_media: 0,
    total_avaliacoes: 0,
    taxa_aceite: 0,
    meses_atuacao: 0,
  });
  const [distribuicao, setDistribuicao] = useState<DistribuicaoNotas[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPublica[]>([]);
  const [servicos, setServicos] = useState<TipoServico[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeProfissional[]>([]);
  const [portfolio, setPortfolio] = useState<ItemPortfolio[]>([]);
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug || !driver_slug) {
      setErro(true);
      setCarregando(false);
      return;
    }

    async function carregar() {
      setCarregando(true);
      try {
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id, name, slug")
          .eq("slug", slug!)
          .single();

        if (!tenant) { setErro(true); return; }

        const { data: driver } = await supabase
          .from("drivers")
          .select("*")
          .eq("tenant_id", tenant.id)
          .eq("slug", driver_slug!)
          .single();

        if (!driver) { setErro(true); return; }

        const { data: user } = await supabase
          .from("users")
          .select("full_name, avatar_url")
          .eq("id", driver.id)
          .single();

        const tipoProfissional = ((driver as any).professional_type as PerfilPublicoMotorista["professional_type"]) ?? "driver";

        setPerfil({
          id: driver.id,
          nome: user?.full_name ?? "Motorista",
          avatar_url: user?.avatar_url ?? null,
          bio: driver.bio,
          cover_url: driver.cover_url,
          slug: driver.slug,
          is_online: driver.is_online,
          is_verified: driver.is_verified,
          vehicle_model: driver.vehicle_model,
          vehicle_year: driver.vehicle_year,
          vehicle_color: driver.vehicle_color,
          vehicle_plate: driver.vehicle_plate,
          cashback_pct: driver.cashback_pct,
          tenant_slug: tenant.slug,
          tenant_nome: tenant.name,
          professional_type: tipoProfissional,
          credential_verified: !!(driver as any).credential_verified,
          credential_type: ((driver as any).credential_type as string) ?? null,
          credential_number: ((driver as any).credential_number as string) ?? null,
          service_categories: ((driver as any).service_categories as string[]) ?? [],
        });

        // Reviews
        const { data: reviews } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at")
          .eq("driver_id", driver.id)
          .order("created_at", { ascending: false })
          .limit(20);

        const allReviews = reviews ?? [];
        setAvaliacoes(allReviews.slice(0, 10));

        const dist: DistribuicaoNotas[] = [5, 4, 3, 2, 1].map((e) => {
          const qtd = allReviews.filter((r) => r.rating === e).length;
          return {
            estrela: e,
            quantidade: qtd,
            percentual: allReviews.length > 0 ? (qtd / allReviews.length) * 100 : 0,
          };
        });
        setDistribuicao(dist);

        const media =
          allReviews.length > 0
            ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
            : 0;

        const { data: dispatches } = await supabase
          .from("ride_dispatches")
          .select("response")
          .eq("driver_id", driver.id);

        const totalDisp = dispatches?.length ?? 0;
        const aceitos = dispatches?.filter((d) => d.response === "accepted").length ?? 0;
        const taxa = totalDisp > 0 ? (aceitos / totalDisp) * 100 : 100;

        const criado = new Date(driver.created_at);
        const agora = new Date();
        const meses = Math.max(
          1,
          (agora.getFullYear() - criado.getFullYear()) * 12 +
            (agora.getMonth() - criado.getMonth())
        );

        setMetricas({
          nota_media: Math.round(media * 10) / 10,
          total_avaliacoes: allReviews.length,
          taxa_aceite: Math.round(taxa),
          meses_atuacao: meses,
        });

        // Carrega serviços e disponibilidade quando o profissional oferece serviços
        if (tipoProfissional === "service_provider" || tipoProfissional === "both") {
          const [{ data: servs }, { data: avail }] = await Promise.all([
            supabase
              .from("service_types" as any)
              .select("*")
              .eq("driver_id", driver.id)
              .eq("is_active", true)
              .order("created_at", { ascending: true }),
            supabase
              .from("professional_availability" as any)
              .select("*")
              .eq("driver_id", driver.id)
              .eq("is_active", true)
              .order("day_of_week", { ascending: true })
              .order("start_time", { ascending: true }),
          ]);
          setServicos((servs ?? []) as unknown as TipoServico[]);
          setDisponibilidade((avail ?? []) as unknown as DisponibilidadeProfissional[]);

          const [itensPortfolio, membrosEquipe] = await Promise.all([
            listarPortfolioPorMotorista(driver.id),
            listarEquipeDoMotorista(driver.id),
          ]);
          setPortfolio(itensPortfolio);
          setEquipe(membrosEquipe);
        }
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [slug, driver_slug]);

  return {
    perfil,
    metricas,
    distribuicao,
    avaliacoes,
    servicos,
    disponibilidade,
    portfolio,
    equipe,
    carregando,
    erro,
  };
}
