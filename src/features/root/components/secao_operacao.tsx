import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, CalendarClock, Loader2 } from "lucide-react";

interface CorridaItem {
  id: string;
  tenant_nome: string;
  status: string;
  origem: string | null;
  destino: string | null;
  preco: number | null;
  criado_em: string;
}

interface AgendamentoItem {
  id: string;
  tenant_nome: string;
  status: string;
  servico: string | null;
  agendado_em: string;
  preco: number | null;
}

const STATUS_RIDE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  dispatching: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  accepted: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  ongoing: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const STATUS_BOOK: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

export function SecaoOperacao() {
  const [corridas, setCorridas] = useState<CorridaItem[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id, name");
      const tenantMap = new Map((tenants || []).map((t) => [t.id, t.name]));

      const [requestsRes, bookingsRes, servicosRes] = await Promise.all([
        supabase
          .from("ride_requests")
          .select(
            "id, tenant_id, status, origin_address, dest_address, offered_price, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("service_bookings")
          .select(
            "id, tenant_id, status, service_type_id, scheduled_at, price_agreed",
          )
          .order("scheduled_at", { ascending: false })
          .limit(50),
        supabase.from("service_types").select("id, name"),
      ]);

      const servicoMap = new Map(
        (servicosRes.data || []).map((s) => [s.id, s.name]),
      );

      setCorridas(
        (requestsRes.data || []).map((r) => ({
          id: r.id,
          tenant_nome: tenantMap.get(r.tenant_id) || "—",
          status: r.status,
          origem: r.origin_address,
          destino: r.dest_address,
          preco: r.offered_price,
          criado_em: r.created_at,
        })),
      );

      setAgendamentos(
        (bookingsRes.data || []).map((b) => ({
          id: b.id,
          tenant_nome: tenantMap.get(b.tenant_id) || "—",
          status: b.status,
          servico: servicoMap.get(b.service_type_id) || null,
          agendado_em: b.scheduled_at,
          preco: b.price_agreed,
        })),
      );
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando operação...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <Tabs defaultValue="corridas" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="corridas" className="gap-2">
            <Car className="h-4 w-4" />
            Corridas ({corridas.length})
          </TabsTrigger>
          <TabsTrigger value="agendamentos" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            Agendamentos ({agendamentos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="corridas" className="mt-4 space-y-2">
          {corridas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma corrida recente.
            </p>
          ) : (
            corridas.map((c) => (
              <Card key={c.id} className="border-border bg-card">
                <CardContent className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {c.tenant_nome}
                    </span>
                    <Badge
                      variant="outline"
                      className={STATUS_RIDE[c.status] || ""}
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.origem || "—"} → {c.destino || "—"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {new Date(c.criado_em).toLocaleString("pt-BR")}
                    </span>
                    <span className="text-primary font-medium">
                      {c.preco ? `R$ ${c.preco.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="agendamentos" className="mt-4 space-y-2">
          {agendamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento recente.
            </p>
          ) : (
            agendamentos.map((a) => (
              <Card key={a.id} className="border-border bg-card">
                <CardContent className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {a.tenant_nome}
                    </span>
                    <Badge
                      variant="outline"
                      className={STATUS_BOOK[a.status] || ""}
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {a.servico || "Serviço"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {new Date(a.agendado_em).toLocaleString("pt-BR")}
                    </span>
                    <span className="text-primary font-medium">
                      {a.preco ? `R$ ${a.preco.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
