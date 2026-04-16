import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StatsPlataforma, TenantResumo } from "../types/tipos_root";

export function SecaoVisaoGeral() {
  const [stats, setStats] = useState<StatsPlataforma | null>(null);
  const [tenants, setTenants] = useState<TenantResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const [tenantsRes, driversRes, affiliatesRes, subsRes, ridesRes] = await Promise.all([
        supabase.from("tenants").select("id, name, slug, status, plan_id"),
        supabase.from("drivers").select("id, tenant_id"),
        supabase.from("affiliates").select("id, tenant_id"),
        supabase.from("subscriptions").select("tenant_id, plan_id, status").eq("status", "active"),
        supabase.from("rides").select("id, tenant_id, price_paid, created_at"),
      ]);

      const allTenants = tenantsRes.data || [];
      const allDrivers = driversRes.data || [];
      const allAffiliates = affiliatesRes.data || [];
      const allSubs = subsRes.data || [];
      const allRides = ridesRes.data || [];

      const { data: plans } = await supabase.from("plans").select("id, name, price_monthly");
      const planMap = new Map((plans || []).map((p) => [p.id, p]));

      const mesAtual = new Date();
      mesAtual.setDate(1); mesAtual.setHours(0, 0, 0, 0);
      const corridasMes = allRides.filter((r) => new Date(r.created_at) >= mesAtual);
      const receitaMes = corridasMes.reduce((a, r) => a + (r.price_paid || 0), 0);
      const mrr = allSubs.reduce((a, s) => a + (planMap.get(s.plan_id)?.price_monthly || 0), 0);

      setStats({
        totalTenants: allTenants.length,
        totalMotoristas: allDrivers.length,
        totalAfiliados: allAffiliates.length,
        mrr,
        corridasMes: corridasMes.length,
        receitaMes,
      });

      setTenants(allTenants.map((t) => {
        const sub = allSubs.find((s) => s.tenant_id === t.id);
        const plan = sub ? planMap.get(sub.plan_id) : null;
        return {
          id: t.id, nome: t.name, slug: t.slug, status: t.status,
          plano: plan?.name || null,
          motoristas: allDrivers.filter((d) => d.tenant_id === t.id).length,
          afiliados: allAffiliates.filter((a) => a.tenant_id === t.id).length,
          mrr: plan?.price_monthly || 0,
        };
      }));
    } finally { setCarregando(false); }
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  const STAT_ITEMS = stats ? [
    { label: "Tenants", valor: stats.totalTenants },
    { label: "Motoristas", valor: stats.totalMotoristas },
    { label: "Afiliados", valor: stats.totalAfiliados },
    { label: "MRR", valor: `R$ ${stats.mrr.toFixed(2)}` },
    { label: "Corridas/mes", valor: stats.corridasMes },
    { label: "Receita do mes", valor: `R$ ${stats.receitaMes.toFixed(2)}` },
  ] : [];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {STAT_ITEMS.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((t) => (
          <Card key={t.id} className="border-border bg-card">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{t.nome}</h3>
                <Badge variant={t.status === "active" ? "default" : "destructive"}>{t.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">/{t.slug}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Plano: {t.plano || "—"}</span>
                <span>{t.motoristas} motoristas</span>
                <span>MRR: R$ {t.mrr.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
