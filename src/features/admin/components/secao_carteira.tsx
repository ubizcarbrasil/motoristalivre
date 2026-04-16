import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  descricao: string | null;
  data: string;
}

export function SecaoCarteira() {
  const { usuario } = useAutenticacao();
  const [saldo, setSaldo] = useState(0);
  const [totalGanho, setTotalGanho] = useState(0);
  const [totalSacado, setTotalSacado] = useState(0);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      const { data: wallets } = await supabase
        .from("wallets")
        .select("id, balance, total_earned, total_withdrawn")
        .eq("tenant_id", perfil.tenant_id)
        .eq("owner_type", "group");

      if (wallets && wallets.length > 0) {
        const w = wallets[0];
        setSaldo(w.balance);
        setTotalGanho(w.total_earned);
        setTotalSacado(w.total_withdrawn);

        const { data: txs } = await supabase
          .from("wallet_transactions")
          .select("id, type, amount, description, created_at")
          .eq("wallet_id", w.id)
          .order("created_at", { ascending: false })
          .limit(50);

        setTransacoes(
          (txs || []).map((t) => ({
            id: t.id,
            tipo: t.type,
            valor: t.amount,
            descricao: t.description,
            data: t.created_at,
          }))
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  const ehEntrada = (tipo: string) => ["ride_earning", "commission_transbordo", "commission_affiliate", "pix_topup"].includes(tipo);

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo disponivel</p>
            <p className="text-xl font-bold text-primary">R$ {saldo.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total ganho</p>
            <p className="text-xl font-bold text-foreground">R$ {totalGanho.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total sacado</p>
            <p className="text-xl font-bold text-foreground">R$ {totalSacado.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descricao</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transacoes.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                {ehEntrada(t.tipo) ? (
                  <ArrowDown className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowUp className="h-4 w-4 text-destructive" />
                )}
              </TableCell>
              <TableCell className="text-foreground text-sm">{t.descricao || t.tipo}</TableCell>
              <TableCell className={ehEntrada(t.tipo) ? "text-primary" : "text-destructive"}>
                {ehEntrada(t.tipo) ? "+" : "-"}R$ {Math.abs(t.valor).toFixed(2)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(t.data).toLocaleDateString("pt-BR")}
              </TableCell>
            </TableRow>
          ))}
          {transacoes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma transacao</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
