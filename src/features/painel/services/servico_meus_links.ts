import { supabase } from "@/integrations/supabase/client";
import type { CanalLink, StatsCanalMes } from "../types/tipos_meus_links";

function inicioDoMes() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function statsPorOrigem(
  campoId: "origin_driver_id" | "origin_affiliate_id",
  driverId: string,
): Promise<StatsCanalMes> {
  const desde = inicioDoMes();

  const { data: rides } = await supabase
    .from("rides")
    .select("price_paid")
    .eq(campoId, driverId)
    .gte("created_at", desde);

  const corridas = rides?.length ?? 0;
  const ganhos = rides?.reduce((a, r) => a + (r.price_paid ?? 0), 0) ?? 0;

  const { count: requests } = await supabase
    .from("ride_requests")
    .select("id", { count: "exact", head: true })
    .eq(campoId, driverId)
    .gte("created_at", desde);

  const conversao = requests && requests > 0 ? (corridas / requests) * 100 : 0;

  return { corridas, ganhos, conversao };
}

async function statsTenant(tenantId: string): Promise<StatsCanalMes> {
  const desde = inicioDoMes();

  const { data: rides } = await supabase
    .from("rides")
    .select("price_paid")
    .eq("tenant_id", tenantId)
    .gte("created_at", desde);

  const corridas = rides?.length ?? 0;
  const ganhos = rides?.reduce((a, r) => a + (r.price_paid ?? 0), 0) ?? 0;

  const { count: requests } = await supabase
    .from("ride_requests")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("created_at", desde);

  const conversao = requests && requests > 0 ? (corridas / requests) * 100 : 0;
  return { corridas, ganhos, conversao };
}

async function statsServicos(driverId: string): Promise<StatsCanalMes> {
  const desde = inicioDoMes();

  const { data: bookings } = await supabase
    .from("service_bookings" as any)
    .select("price_agreed, status")
    .eq("driver_id", driverId)
    .gte("created_at", desde);

  const lista = ((bookings ?? []) as unknown) as Array<{
    price_agreed: number | null;
    status: string;
  }>;
  const concluidos = lista.filter((b) => b.status === "completed");
  const corridas = concluidos.length;
  const ganhos = concluidos.reduce((a, b) => a + Number(b.price_agreed ?? 0), 0);
  const total = lista.length;
  const conversao = total > 0 ? (corridas / total) * 100 : 0;

  return { corridas, ganhos, conversao };
}

async function statsIndicacaoServicos(driverId: string): Promise<StatsCanalMes> {
  const desde = inicioDoMes();

  const { data: bookings } = await supabase
    .from("service_bookings" as any)
    .select("price_agreed, status")
    .eq("origin_driver_id", driverId)
    .gte("created_at", desde);

  const lista = ((bookings ?? []) as unknown) as Array<{
    price_agreed: number | null;
    status: string;
  }>;
  const concluidos = lista.filter((b) => b.status === "completed");
  const agendamentos = concluidos.length;
  const ganhos = concluidos.reduce((a, b) => a + Number(b.price_agreed ?? 0), 0);
  const total = lista.length;
  const conversao = total > 0 ? (agendamentos / total) * 100 : 0;

  return { corridas: agendamentos, ganhos, conversao };
}

interface BuscarCanaisParams {
  driverId: string;
  driverSlug: string;
  tenantId: string;
  tenantSlug: string;
  tenantNome: string;
  ehAdminGrupo: boolean;
  professionalType: "driver" | "service_provider" | "both";
  /**
   * Módulos ativos da tribo. Define qual link público de grupo será gerado:
   * - 'services' → /s/{slug}
   * - caso contrário → /m/{slug}
   */
  activeModules?: string[];
}

export async function buscarCanaisLinks(p: BuscarCanaisParams): Promise<CanalLink[]> {
  const base = typeof window !== "undefined" ? window.location.origin : "https://tribocar.app";

  const ofereceCorridas = p.professionalType === "driver" || p.professionalType === "both";
  const ofereceServicos =
    p.professionalType === "service_provider" || p.professionalType === "both";
  const triboEhServicos = (p.activeModules ?? []).includes("services");

  const canais: CanalLink[] = [];

  if (ofereceServicos) {
    const [stats, statsIndicacao] = await Promise.all([
      statsServicos(p.driverId),
      statsIndicacaoServicos(p.driverId),
    ]);
    canais.push({
      tipo: "servicos",
      titulo: "Link de Serviços",
      descricao: "Para clientes verem seu portfólio e agendarem horário.",
      url: `${base}/s/${p.tenantSlug}/${p.driverSlug}`,
      handle: `@${p.driverSlug}`,
      cor: "dourado",
      stats,
      rotuloMetricas: {
        primario: "Agendamentos/mês",
        secundario: "Conclusão",
        terciario: "Receita/mês",
      },
    });
    canais.push({
      tipo: "indicacao_servicos",
      titulo: "Link de indicação",
      descricao:
        "Para indicar clientes ao seu grupo e ganhar comissão sobre os agendamentos.",
      url: `${base}/s/${p.tenantSlug}/a/${p.driverSlug}`,
      handle: `@${p.driverSlug}`,
      cor: "azul",
      stats: statsIndicacao,
      rotuloMetricas: {
        primario: "Indicações/mês",
        secundario: "Conversão",
        terciario: "Receita/mês",
      },
    });
  }

  if (ofereceCorridas) {
    const [statsMotorista, statsAfiliado] = await Promise.all([
      statsPorOrigem("origin_driver_id", p.driverId),
      statsPorOrigem("origin_affiliate_id", p.driverId),
    ]);

    canais.push(
      {
        tipo: "motorista",
        titulo: "Link de corrida",
        descricao:
          "Para passageiros pedirem corrida direto com você. Se não atender, o grupo assume.",
        url: `${base}/${p.tenantSlug}/${p.driverSlug}`,
        handle: `@${p.driverSlug}`,
        cor: "roxo",
        stats: statsMotorista,
      },
      {
        tipo: "afiliado",
        titulo: "Link de afiliado",
        descricao: "Para indicar corridas e ganhar comissão por cada uma atendida.",
        url: `${base}/${p.tenantSlug}/a/${p.driverSlug}`,
        handle: `@${p.driverSlug}`,
        cor: "azul",
        stats: statsAfiliado,
      },
    );
  }
  // Profissional puro (modo serviços) não recebe link de afiliado de corridas.

  if (p.ehAdminGrupo) {
    const stats = await statsTenant(p.tenantId);
    const urlGrupo = triboEhServicos
      ? `${base}/s/${p.tenantSlug}`
      : `${base}/m/${p.tenantSlug}`;
    canais.push({
      tipo: "grupo",
      titulo: `Link do grupo ${p.tenantNome}`,
      descricao: triboEhServicos
        ? "Página pública de serviços do seu grupo. Compartilhe para captar clientes."
        : "Página pública de corridas do seu grupo. Compartilhe para captar passageiros.",
      url: urlGrupo,
      handle: `@${p.tenantSlug}`,
      cor: "verde",
      stats,
    });
  }

  return canais;
}
