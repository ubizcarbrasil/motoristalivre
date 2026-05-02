import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ClienteCRM } from "../types/tipos_admin";

const CORES_FREQUENCIA: Record<string, string> = {
  vip: "bg-primary",
  regular: "bg-blue-500",
  risco: "bg-yellow-500",
  perdido: "bg-destructive",
};

const LABELS_FREQUENCIA: Record<string, string> = {
  vip: "VIP",
  regular: "Regular",
  risco: "Em risco",
  perdido: "Perdido",
};

function calcularFrequencia(totalCorridas: number, ultimoAcesso: string | null): "vip" | "regular" | "risco" | "perdido" {
  if (!ultimoAcesso) return "perdido";
  const dias = Math.floor((Date.now() - new Date(ultimoAcesso).getTime()) / (1000 * 60 * 60 * 24));
  if (totalCorridas >= 10 && dias < 7) return "vip";
  if (totalCorridas >= 3 && dias < 30) return "regular";
  if (dias < 60) return "risco";
  return "perdido";
}

type FiltroFrequencia = "todos" | "vip" | "regular" | "risco" | "perdido";

export function SecaoCRM() {
  const { usuario } = useAutenticacao();
  const [clientes, setClientes] = useState<ClienteCRM[]>([]);
  const [filtro, setFiltro] = useState<FiltroFrequencia>("todos");
  const [carregando, setCarregando] = useState(true);
  const [modoServicos, setModoServicos] = useState(false);

  const labelMetrica = modoServicos ? "Atendimentos" : "Corridas";

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      const { data: tenant } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("id", perfil.tenant_id)
        .maybeSingle();
      const modulos = (tenant?.active_modules ?? ["mobility"]) as string[];
      setModoServicos(modulos.includes("services") && !modulos.includes("mobility"));

      const { data: passengers } = await supabase
        .from("passengers")
        .select("id, total_rides, total_spent, cashback_balance, origin_source, last_ride_at")
        .eq("tenant_id", perfil.tenant_id);

      if (!passengers) return;

      const ids = passengers.map((p) => p.id);
      const { data: users } = await supabase.from("users").select("id, full_name, phone").in("id", ids);

      setClientes(
        passengers.map((p) => {
          const u = users?.find((u) => u.id === p.id);
          return {
            id: p.id,
            nome: u?.full_name || null,
            telefone: u?.phone || null,
            totalCorridas: p.total_rides,
            totalGasto: p.total_spent,
            saldoCashback: p.cashback_balance,
            origem: p.origin_source,
            ultimoAcesso: p.last_ride_at,
            frequencia: calcularFrequencia(p.total_rides, p.last_ride_at),
          };
        })
      );
    } finally {
      setCarregando(false);
    }
  }

  const filtrados = filtro === "todos" ? clientes : clientes.filter((c) => c.frequencia === filtro);

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {(["todos", "vip", "regular", "risco", "perdido"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtro === f ? "default" : "outline"}
            onClick={() => setFiltro(f)}
          >
            {f === "todos" ? "Todos" : LABELS_FREQUENCIA[f]}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { /* TODO */ }}>Reativar selecionados</Button>
        <Button size="sm" variant="outline" onClick={() => { /* TODO */ }}>Campanha cashback</Button>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {filtrados.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{c.nome || "Sem nome"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.telefone || "—"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`h-2 w-6 rounded-full ${CORES_FREQUENCIA[c.frequencia]}`} />
                <Badge variant="secondary" className="text-xs">{LABELS_FREQUENCIA[c.frequencia]}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{labelMetrica}</p>
                <p className="text-foreground font-medium">{c.totalCorridas}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gasto</p>
                <p className="text-foreground font-medium">R$ {c.totalGasto.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cashback</p>
                <p className="text-foreground font-medium">R$ {c.saldoCashback.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
              <span>Origem: {c.origem || "—"}</span>
              <span>{c.ultimoAcesso ? new Date(c.ultimoAcesso).toLocaleDateString("pt-BR") : "—"}</span>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado</p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Frequencia</TableHead>
            <TableHead>{labelMetrica}</TableHead>
            <TableHead>Gasto total</TableHead>
            <TableHead>Cashback</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Ultimo acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrados.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-foreground">{c.nome || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">{c.telefone || "—"}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-8 rounded-full ${CORES_FREQUENCIA[c.frequencia]}`} />
                  <Badge variant="secondary" className="text-xs">
                    {LABELS_FREQUENCIA[c.frequencia]}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{c.totalCorridas}</TableCell>
              <TableCell>R$ {c.totalGasto.toFixed(2)}</TableCell>
              <TableCell>R$ {c.saldoCashback.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{c.origem || "—"}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {c.ultimoAcesso ? new Date(c.ultimoAcesso).toLocaleDateString("pt-BR") : "—"}
              </TableCell>
            </TableRow>
          ))}
          {filtrados.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum cliente encontrado</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
