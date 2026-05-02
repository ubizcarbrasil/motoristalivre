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
  /** Em modo serviços: nome do serviço contratado */
  servico?: string | null;
  /** Em modo serviços: data agendada do serviço */
  agendadoEm?: string | null;
}

type Modo = "mobilidade" | "servicos";

export function SecaoCorridas() {
  const { usuario } = useAutenticacao();
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState<Modo>("mobilidade");

  const ehServicos = modo === "servicos";
  const labelTitulo = ehServicos ? "agendamento" : "corrida";
  const labelTituloPlural = ehServicos ? "agendamentos" : "corridas";

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      // Detecta modo da tribo
      const { data: tenant } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("id", perfil.tenant_id)
        .maybeSingle();
      const modulos = (tenant?.active_modules ?? ["mobility"]) as string[];
      const ehServicosTribo = modulos.includes("services") && !modulos.includes("mobility");
      setModo(ehServicosTribo ? "servicos" : "mobilidade");

      if (ehServicosTribo) {
        const { data: bookings } = await supabase
          .from("service_bookings" as any)
          .select(
            "id, customer_id, driver_id, service_type_id, price_agreed, status, scheduled_at, created_at, address",
          )
          .eq("tenant_id", perfil.tenant_id)
          .order("created_at", { ascending: false })
          .limit(100);

        const lista = (bookings as any[] | null) ?? [];
        const driverIds = [...new Set(lista.map((b) => b.driver_id).filter(Boolean))];
        const customerIds = [...new Set(lista.map((b) => b.customer_id).filter(Boolean))];
        const serviceIds = [...new Set(lista.map((b) => b.service_type_id).filter(Boolean))];
        const allIds = [...new Set([...driverIds, ...customerIds])];

        const [{ data: users }, { data: servicos }] = await Promise.all([
          allIds.length
            ? supabase.from("users").select("id, full_name").in("id", allIds)
            : Promise.resolve({ data: [] as any[] }),
          serviceIds.length
            ? supabase
                .from("service_types" as any)
                .select("id, name")
                .in("id", serviceIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);

        setCorridas(
          lista.map((b) => {
            const profissional = users?.find((u: any) => u.id === b.driver_id);
            const cliente = users?.find((u: any) => u.id === b.customer_id);
            const servico = (servicos as any[] | null)?.find((s) => s.id === b.service_type_id);
            return {
              id: b.id,
              passageiro: cliente?.full_name || null,
              motorista: profissional?.full_name || null,
              origem: b.address || null,
              destino: null,
              valor: b.price_agreed != null ? Number(b.price_agreed) : null,
              status: b.status || "scheduled",
              criadaEm: b.created_at,
              transbordo: false,
              origemLink: null,
              servico: servico?.name || null,
              agendadoEm: b.scheduled_at || null,
            };
          }),
        );
        return;
      }

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
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {["todos", "completed", "in_progress", "cancelled"].map((s) => (
          <Button key={s} size="sm" variant={filtroStatus === s ? "default" : "outline"} onClick={() => setFiltroStatus(s)}>
            {s === "todos" ? "Todos" : s === "completed" ? "Finalizadas" : s === "in_progress" ? "Em andamento" : "Canceladas"}
          </Button>
        ))}
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {filtradas.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{c.passageiro || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">com {c.motorista || "—"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-semibold text-foreground">
                  {c.valor ? `R$ ${c.valor.toFixed(2)}` : "—"}
                </span>
                <Badge variant={c.status === "completed" ? "default" : "secondary"} className="text-xs">
                  {c.status}
                </Badge>
              </div>
            </div>
            {(c.origem || c.destino) && (
              <div className="space-y-0.5 text-xs text-muted-foreground pt-1 border-t border-border">
                {c.origem && <p className="truncate">De: {c.origem}</p>}
                {c.destino && <p className="truncate">Para: {c.destino}</p>}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(c.criadaEm).toLocaleDateString("pt-BR")}</span>
              {c.transbordo && <Badge variant="outline" className="text-xs">Transbordo</Badge>}
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma corrida encontrada</p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
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
    </div>
  );
}
