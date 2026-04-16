import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Corrida {
  id: string;
  passageiro: string | null;
  motorista: string | null;
  origem: string | null;
  destino: string | null;
  valor: number | null;
  status: string;
  criadaEm: string;
  transbordo: boolean;
  origemLink: string | null;
}

export function SecaoCorridas() {
  const { usuario } = useAutenticacao();
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      const { data: rides } = await supabase
        .from("rides")
        .select("id, passenger_id, driver_id, price_paid, is_transbordo, created_at, origin_driver_id")
        .eq("tenant_id", perfil.tenant_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!rides) return;

      const driverIds = [...new Set(rides.map((r) => r.driver_id))];
      const passengerIds = [...new Set(rides.map((r) => r.passenger_id))];
      const allIds = [...new Set([...driverIds, ...passengerIds])];

      const { data: users } = await supabase.from("users").select("id, full_name").in("id", allIds);

      const rideRequestIds = rides.map((r) => r.id);
      const { data: requests } = await supabase
        .from("ride_requests")
        .select("id, origin_address, dest_address, status")
        .in("id", rideRequestIds);

      setCorridas(
        rides.map((r) => {
          const motorista = users?.find((u) => u.id === r.driver_id);
          const passageiro = users?.find((u) => u.id === r.passenger_id);
          const req = requests?.find((rr) => rr.id === r.id);
          return {
            id: r.id,
            passageiro: passageiro?.full_name || null,
            motorista: motorista?.full_name || null,
            origem: req?.origin_address || null,
            destino: req?.dest_address || null,
            valor: r.price_paid,
            status: req?.status || "completed",
            criadaEm: r.created_at,
            transbordo: r.is_transbordo,
            origemLink: r.origin_driver_id ? "Transbordo" : null,
          };
        })
      );
    } finally {
      setCarregando(false);
    }
  }

  const filtradas = filtroStatus === "todos" ? corridas : corridas.filter((c) => c.status === filtroStatus);

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2">
        {["todos", "completed", "in_progress", "cancelled"].map((s) => (
          <Button key={s} size="sm" variant={filtroStatus === s ? "default" : "outline"} onClick={() => setFiltroStatus(s)}>
            {s === "todos" ? "Todos" : s === "completed" ? "Finalizadas" : s === "in_progress" ? "Em andamento" : "Canceladas"}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Passageiro</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Transbordo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtradas.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="text-foreground">{c.passageiro || "—"}</TableCell>
              <TableCell className="text-foreground">{c.motorista || "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{c.origem || "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{c.destino || "—"}</TableCell>
              <TableCell>{c.valor ? `R$ ${c.valor.toFixed(2)}` : "—"}</TableCell>
              <TableCell>
                <Badge variant={c.status === "completed" ? "default" : "secondary"}>{c.status}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(c.criadaEm).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>
                {c.transbordo && <Badge variant="outline" className="text-xs">Transbordo</Badge>}
              </TableCell>
            </TableRow>
          ))}
          {filtradas.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">Nenhuma corrida encontrada</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
