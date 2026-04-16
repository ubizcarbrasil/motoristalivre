import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SaquePendente } from "../types/tipos_root";

export function SecaoFinanceiro() {
  const [mrr, setMrr] = useState(0);
  const [receitaMes, setReceitaMes] = useState(0);
  const [saques, setSaques] = useState<SaquePendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const { data: subs } = await supabase.from("subscriptions").select("plan_id").eq("status", "active");
      const { data: plans } = await supabase.from("plans").select("id, price_monthly");
      const planMap = new Map((plans || []).map((p) => [p.id, p.price_monthly]));
      setMrr((subs || []).reduce((a, s) => a + (planMap.get(s.plan_id) || 0), 0));

      const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
      const { data: rides } = await supabase.from("rides").select("price_paid").gte("created_at", mes.toISOString());
      setReceitaMes((rides || []).reduce((a, r) => a + (r.price_paid || 0), 0));

      const { data: payouts } = await supabase.from("payouts").select("id, wallet_id, amount, pix_key, requested_at, tenant_id").eq("status", "pending");

      const tenantIds = [...new Set((payouts || []).map((p) => p.tenant_id))];
      const { data: tenants } = tenantIds.length > 0
        ? await supabase.from("tenants").select("id, name").in("id", tenantIds)
        : { data: [] };
      const tenantMap = new Map((tenants || []).map((t) => [t.id, t.name]));

      setSaques((payouts || []).map((p) => ({
        id: p.id, donoNome: null,
        tenantNome: tenantMap.get(p.tenant_id) || "—",
        valor: p.amount, pixKey: p.pix_key,
        solicitadoEm: p.requested_at,
      })));
    } finally { setCarregando(false); }
  }

  async function aprovarSaque(id: string) {
    const { error } = await supabase.from("payouts").update({ status: "completed" as const, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Erro ao aprovar saque"); return; }
    toast.success("Saque aprovado");
    carregar();
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">MRR</p><p className="text-xl font-bold text-primary">R$ {mrr.toFixed(2)}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Receita do mes</p><p className="text-xl font-bold text-foreground">R$ {receitaMes.toFixed(2)}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Saques pendentes</p><p className="text-xl font-bold text-foreground">{saques.length}</p></CardContent></Card>
      </div>

      <h2 className="text-sm font-semibold text-foreground">Saques aguardando aprovacao</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>PIX</TableHead>
            <TableHead>Solicitado em</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {saques.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-foreground">{s.tenantNome}</TableCell>
              <TableCell>R$ {s.valor.toFixed(2)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{s.pixKey || "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(s.solicitadoEm).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell><Button size="sm" onClick={() => aprovarSaque(s.id)}>Aprovar</Button></TableCell>
            </TableRow>
          ))}
          {saques.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum saque pendente</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
