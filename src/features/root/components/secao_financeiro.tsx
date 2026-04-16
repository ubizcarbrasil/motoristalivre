import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { aprovarSaque, rejeitarSaque } from "@/compartilhados/services/servico_saque";
import type { SaquePendente } from "../types/tipos_root";

const TIPO_DONO_LABEL: Record<string, string> = {
  driver: "Motorista",
  affiliate: "Afiliado",
  group: "Grupo",
};

export function SecaoFinanceiro() {
  const [mrr, setMrr] = useState(0);
  const [receitaMes, setReceitaMes] = useState(0);
  const [saques, setSaques] = useState<SaquePendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const { data: subs } = await supabase.from("subscriptions").select("plan_id").eq("status", "active");
      const { data: plans } = await supabase.from("plans").select("id, price_monthly");
      const planMap = new Map((plans || []).map((p) => [p.id, p.price_monthly]));
      setMrr((subs || []).reduce((a, s) => a + (planMap.get(s.plan_id) || 0), 0));

      const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
      const { data: rides } = await supabase.from("rides").select("price_paid").gte("created_at", mes.toISOString());
      setReceitaMes((rides || []).reduce((a, r) => a + (r.price_paid || 0), 0));

      const { data: payouts } = await supabase
        .from("payouts")
        .select("id, wallet_id, amount, pix_key, pix_key_type, requested_at, tenant_id")
        .eq("status", "pending")
        .order("requested_at", { ascending: true });

      const walletIds = [...new Set((payouts || []).map((p) => p.wallet_id))];
      const tenantIds = [...new Set((payouts || []).map((p) => p.tenant_id))];

      const [{ data: wallets }, { data: tenants }] = await Promise.all([
        walletIds.length > 0
          ? supabase.from("wallets").select("id, owner_id, owner_type").in("id", walletIds)
          : Promise.resolve({ data: [] as { id: string; owner_id: string; owner_type: string }[] }),
        tenantIds.length > 0
          ? supabase.from("tenants").select("id, name").in("id", tenantIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      ]);

      const ownerIds = [...new Set((wallets || []).map((w) => w.owner_id))];
      const { data: users } = ownerIds.length > 0
        ? await supabase.from("users").select("id, full_name").in("id", ownerIds)
        : { data: [] as { id: string; full_name: string | null }[] };

      const walletMap = new Map((wallets || []).map((w) => [w.id, w]));
      const tenantMap = new Map((tenants || []).map((t) => [t.id, t.name]));
      const userMap = new Map((users || []).map((u) => [u.id, u.full_name]));

      setSaques((payouts || []).map((p) => {
        const w = walletMap.get(p.wallet_id);
        return {
          id: p.id,
          donoNome: w ? (userMap.get(w.owner_id) ?? null) : null,
          donoTipo: (w?.owner_type as SaquePendente["donoTipo"]) ?? "driver",
          tenantNome: tenantMap.get(p.tenant_id) || "—",
          valor: p.amount,
          pixKey: p.pix_key,
          pixKeyType: p.pix_key_type,
          solicitadoEm: p.requested_at,
        };
      }));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleAprovar = async (id: string) => {
    setProcessando(id);
    try {
      await aprovarSaque(id);
      toast.success("Saque aprovado");
      await carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao aprovar saque");
    } finally {
      setProcessando(null);
    }
  };

  const handleRejeitar = async (id: string) => {
    setProcessando(id);
    try {
      await rejeitarSaque(id);
      toast.success("Saque rejeitado — valor devolvido");
      await carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao rejeitar saque");
    } finally {
      setProcessando(null);
    }
  };

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">MRR</p><p className="text-xl font-bold text-primary">R$ {mrr.toFixed(2)}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Receita do mês</p><p className="text-xl font-bold text-foreground">R$ {receitaMes.toFixed(2)}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Saques pendentes</p><p className="text-xl font-bold text-foreground">{saques.length}</p></CardContent></Card>
      </div>

      <h2 className="text-sm font-semibold text-foreground">Saques aguardando aprovação</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Solicitante</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Chave PIX</TableHead>
            <TableHead>Solicitado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {saques.map((s) => {
            const ocupado = processando === s.id;
            return (
              <TableRow key={s.id}>
                <TableCell className="text-foreground">{s.donoNome ?? "—"}</TableCell>
                <TableCell><Badge variant="secondary">{TIPO_DONO_LABEL[s.donoTipo] ?? s.donoTipo}</Badge></TableCell>
                <TableCell className="text-foreground">{s.tenantNome}</TableCell>
                <TableCell className="font-semibold text-primary">R$ {s.valor.toFixed(2)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="text-foreground">{s.pixKey || "—"}</span>
                    {s.pixKeyType && <span className="text-[10px] uppercase">{s.pixKeyType}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(s.solicitadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" disabled={ocupado} onClick={() => handleRejeitar(s.id)}>
                      {ocupado ? <Loader2 className="w-3 h-3 animate-spin" /> : "Rejeitar"}
                    </Button>
                    <Button size="sm" disabled={ocupado} onClick={() => handleAprovar(s.id)}>
                      {ocupado ? <Loader2 className="w-3 h-3 animate-spin" /> : "Aprovar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {saques.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum saque pendente</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
