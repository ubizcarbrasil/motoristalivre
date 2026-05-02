import { supabase } from "@/integrations/supabase/client";
import type {
  KpisMinhaRede,
  MembroRecrutado,
  RepasseMensal,
} from "../types/tipos_minha_rede";

/**
 * Lista profissionais recrutados pelo usuário (referrals.referrer_id = userId).
 */
export async function listarRecrutados(
  userId: string,
): Promise<MembroRecrutado[]> {
  const { data: refs } = await supabase
    .from("referrals")
    .select(
      "id, referred_id, signup_commission_amount, total_monthly_earned, monthly_commission_active, created_at",
    )
    .eq("referrer_id", userId)
    .eq("referral_type", "driver")
    .order("created_at", { ascending: false });

  const lista = refs ?? [];
  if (lista.length === 0) return [];

  const ids = lista.map((r) => r.referred_id);
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, avatar_url")
    .in("id", ids);

  const mapaUsers = new Map((users ?? []).map((u) => [u.id, u]));

  return lista.map((r) => ({
    referral_id: r.id,
    recruited_id: r.referred_id,
    nome: mapaUsers.get(r.referred_id)?.full_name ?? "Profissional",
    avatar_url: mapaUsers.get(r.referred_id)?.avatar_url ?? null,
    signup_amount: Number(r.signup_commission_amount ?? 0),
    total_monthly_earned: Number(r.total_monthly_earned ?? 0),
    monthly_active: !!r.monthly_commission_active,
    created_at: r.created_at,
  }));
}

/**
 * Lista repasses mensais (recorrentes) recebidos pelo usuário.
 */
export async function listarRepassesMensais(
  userId: string,
  limite = 24,
): Promise<RepasseMensal[]> {
  const { data: payouts } = await supabase
    .from("recruitment_monthly_payouts" as any)
    .select("id, ano_mes, amount, recruited_id, created_at")
    .eq("recruiter_id", userId)
    .order("ano_mes", { ascending: false })
    .limit(limite);

  const lista = ((payouts ?? []) as any[]) as Array<{
    id: string;
    ano_mes: string;
    amount: number;
    recruited_id: string;
    created_at: string;
  }>;

  if (lista.length === 0) return [];

  const ids = Array.from(new Set(lista.map((p) => p.recruited_id)));
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", ids);

  const mapaUsers = new Map((users ?? []).map((u) => [u.id, u.full_name]));

  return lista.map((p) => ({
    id: p.id,
    ano_mes: p.ano_mes,
    amount: Number(p.amount),
    recruited_id: p.recruited_id,
    recruited_nome: mapaUsers.get(p.recruited_id) ?? "Profissional",
    created_at: p.created_at,
  }));
}

/**
 * Calcula KPIs derivados a partir das listagens.
 * MRR gerado = soma do price_monthly dos planos ativos cujos tenants foram recrutados.
 */
export async function calcularKpis(userId: string): Promise<KpisMinhaRede> {
  const recrutados = await listarRecrutados(userId);
  const ids = recrutados
    .filter((r) => r.monthly_active)
    .map((r) => r.recruited_id);

  let mrr = 0;
  if (ids.length > 0) {
    // Busca subscriptions ativas dos tenants recrutados (referred_id é owner_user_id)
    const { data: tenants } = await supabase
      .from("tenants")
      .select("id, owner_user_id")
      .in("owner_user_id", ids);

    const tenantIds = (tenants ?? []).map((t) => t.id);
    if (tenantIds.length > 0) {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("plan_id, plans(price_monthly)")
        .in("tenant_id", tenantIds)
        .eq("status", "active");

      ((subs ?? []) as any[]).forEach((s) => {
        const preco = Number(s.plans?.price_monthly ?? 0);
        mrr += preco * 0.05;
      });
    }
  }

  const totalAcumulado =
    recrutados.reduce((acc, r) => acc + r.signup_amount + r.total_monthly_earned, 0);

  // Próxima recorrência: dia 1 do próximo mês
  const agora = new Date();
  const proximo = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  return {
    total_recrutados: recrutados.length,
    recrutados_ativos: recrutados.filter((r) => r.monthly_active).length,
    mrr_gerado: Number(mrr.toFixed(2)),
    total_acumulado: Number(totalAcumulado.toFixed(2)),
    proxima_recorrencia: proximo.toISOString(),
  };
}
