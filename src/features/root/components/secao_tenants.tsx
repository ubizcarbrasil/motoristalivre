import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { TenantResumo } from "../types/tipos_root";

export function SecaoTenants() {
  const [tenants, setTenants] = useState<TenantResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const [tenantsRes, driversRes, affiliatesRes, subsRes] = await Promise.all([
        supabase.from("tenants").select("id, name, slug, status, plan_id"),
        supabase.from("drivers").select("id, tenant_id"),
        supabase.from("affiliates").select("id, tenant_id"),
        supabase.from("subscriptions").select("tenant_id, plan_id, status").eq("status", "active"),
      ]);

      const { data: plans } = await supabase.from("plans").select("id, name, price_monthly");
      const planMap = new Map((plans || []).map((p) => [p.id, p]));

      setTenants((tenantsRes.data || []).map((t) => {
        const sub = (subsRes.data || []).find((s) => s.tenant_id === t.id);
        const plan = sub ? planMap.get(sub.plan_id) : null;
        return {
          id: t.id, nome: t.name, slug: t.slug, status: t.status,
          plano: plan?.name || null,
          motoristas: (driversRes.data || []).filter((d) => d.tenant_id === t.id).length,
          afiliados: (affiliatesRes.data || []).filter((a) => a.tenant_id === t.id).length,
          mrr: plan?.price_monthly || 0,
        };
      }));
    } finally { setCarregando(false); }
  }

  async function alterarStatus(id: string, status: "active" | "suspended") {
    const { error } = await supabase.from("tenants").update({ status }).eq("id", id);
    if (error) { toast.error("Erro ao alterar status"); return; }
    toast.success("Status atualizado");
    carregar();
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Motoristas</TableHead>
            <TableHead>Afiliados</TableHead>
            <TableHead>MRR</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium text-foreground">{t.nome}</TableCell>
              <TableCell className="text-xs text-muted-foreground">/{t.slug}</TableCell>
              <TableCell>{t.plano || "—"}</TableCell>
              <TableCell><Badge variant={t.status === "active" ? "default" : "destructive"}>{t.status}</Badge></TableCell>
              <TableCell>{t.motoristas}</TableCell>
              <TableCell>{t.afiliados}</TableCell>
              <TableCell>R$ {t.mrr.toFixed(2)}</TableCell>
              <TableCell>
                <Button size="sm" variant={t.status === "active" ? "destructive" : "default"}
                  onClick={() => alterarStatus(t.id, t.status === "active" ? "suspended" : "active")}>
                  {t.status === "active" ? "Suspender" : "Ativar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {tenants.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum tenant</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
