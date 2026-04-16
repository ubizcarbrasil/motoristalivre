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

  // Conversão: corridas concluídas / ride_requests via esse canal no mês
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

interface BuscarCanaisParams {
  driverId: string;
  driverSlug: string;
  tenantId: string;
  tenantSlug: string;
  tenantNome: string;
  ehAdminGrupo: boolean;
}

export async function buscarCanaisLinks(p: BuscarCanaisParams): Promise<CanalLink[]> {
  const base = typeof window !== "undefined" ? window.location.origin : "https://tribocar.app";

  const [statsMotorista, statsAfiliado] = await Promise.all([
    statsPorOrigem("origin_driver_id", p.driverId),
    statsPorOrigem("origin_affiliate_id", p.driverId),
  ]);

  const canais: CanalLink[] = [
    {
      tipo: "motorista",
      titulo: "Meu link de corrida",
      descricao:
        "Corrida chega para você primeiro. Se você não atender, o grupo assume.",
      url: `${base}/${p.tenantSlug}/${p.driverSlug}`,
      handle: `@${p.driverSlug}`,
      cor: "roxo",
      stats: statsMotorista,
    },
    {
      tipo: "afiliado",
      titulo: "Meu link de afiliado",
      descricao:
        "Indique corridas e ganhe comissão por cada uma atendida, mesmo sem dirigir.",
      url: `${base}/${p.tenantSlug}/a/${p.driverSlug}`,
      handle: `@${p.driverSlug}`,
      cor: "azul",
      stats: statsAfiliado,
    },
  ];

  if (p.ehAdminGrupo) {
    const stats = await statsTenant(p.tenantId);
    canais.push({
      tipo: "grupo",
      titulo: `Link do grupo ${p.tenantNome}`,
      descricao: "Página pública do seu grupo. Compartilhe para captar passageiros.",
      url: `${base}/${p.tenantSlug}`,
      handle: `@${p.tenantSlug}`,
      cor: "verde",
      stats,
    });
  }

  return canais;
}
