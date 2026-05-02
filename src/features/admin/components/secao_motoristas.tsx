import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Motorista {
  id: string;
  slug: string;
  nome: string | null;
  corridasTotal: number;
  online: boolean;
  status: string;
}

type Modo = "mobilidade" | "servicos";

export function SecaoMotoristas() {
  const { usuario } = useAutenticacao();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState<Modo>("mobilidade");

  const labelEntidade = modo === "servicos" ? "profissional" : "motorista";
  const labelMetrica = modo === "servicos" ? "Agendamentos" : "Corridas";

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      // Detecta o modo dominante da tribo
      const { data: tenant } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("id", perfil.tenant_id)
        .maybeSingle();
      const modulos = (tenant?.active_modules ?? ["mobility"]) as string[];
      const ehServicos = modulos.includes("services") && !modulos.includes("mobility");
      setModo(ehServicos ? "servicos" : "mobilidade");

      const { data: drivers } = await supabase
        .from("drivers")
        .select("id, slug, is_online, is_verified")
        .eq("tenant_id", perfil.tenant_id);

      if (!drivers) return;

      const ids = drivers.map((d) => d.id);
      const { data: users } = await supabase.from("users").select("id, full_name, status").in("id", ids);

      // Conta corridas (mobilidade) ou agendamentos (serviços) por profissional
      let contagemPorDriver = new Map<string, number>();
      if (ehServicos) {
        const { data: bookings } = await supabase
          .from("service_bookings" as any)
          .select("driver_id")
          .eq("tenant_id", perfil.tenant_id);
        (bookings as any[] | null)?.forEach((b) => {
          contagemPorDriver.set(b.driver_id, (contagemPorDriver.get(b.driver_id) || 0) + 1);
        });
      } else {
        const { data: rides } = await supabase
          .from("rides")
          .select("driver_id")
          .eq("tenant_id", perfil.tenant_id);
        rides?.forEach((r) => {
          if (!r.driver_id) return;
          contagemPorDriver.set(r.driver_id, (contagemPorDriver.get(r.driver_id) || 0) + 1);
        });
      }

      setMotoristas(
        drivers.map((d) => {
          const u = users?.find((u) => u.id === d.id);
          return {
            id: d.id,
            slug: d.slug,
            nome: u?.full_name || d.slug,
            corridasTotal: contagemPorDriver.get(d.id) || 0,
            online: d.is_online,
            status: u?.status || "active",
          };
        })
      );
    } finally {
      setCarregando(false);
    }
  }

  async function alterarStatus(id: string, novoStatus: "active" | "banned") {
    const { error } = await supabase.from("users").update({ status: novoStatus }).eq("id", id);
    if (error) {
      toast.error("Erro ao alterar status");
      return;
    }
    toast.success("Status atualizado");
    carregar();
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6">
      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {motoristas.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {m.online && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  <p className="font-medium text-foreground truncate">{m.nome}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">/{m.slug}</p>
              </div>
              <Badge variant={m.status === "active" ? "default" : "destructive"} className="shrink-0">
                {m.status === "active" ? "Ativo" : m.status === "banned" ? "Suspenso" : "Inativo"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{labelMetrica}: <span className="text-foreground font-medium">{m.corridasTotal}</span></span>
              {m.status === "active" ? (
                <Button size="sm" variant="destructive" onClick={() => alterarStatus(m.id, "banned")}>
                  Suspender
                </Button>
              ) : (
                <Button size="sm" variant="default" onClick={() => alterarStatus(m.id, "active")}>
                  Aprovar
                </Button>
              )}
            </div>
          </div>
        ))}
        {motoristas.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum {labelEntidade} cadastrado</p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>{labelMetrica}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {motoristas.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {m.online && <span className="h-2 w-2 rounded-full bg-primary" />}
                  {m.nome}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">/{m.slug}</TableCell>
              <TableCell>{m.corridasTotal}</TableCell>
              <TableCell>
                <Badge variant={m.status === "active" ? "default" : "destructive"}>
                  {m.status === "active" ? "Ativo" : m.status === "banned" ? "Suspenso" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                {m.status === "active" ? (
                  <Button size="sm" variant="destructive" onClick={() => alterarStatus(m.id, "banned")}>
                    Suspender
                  </Button>
                ) : (
                  <Button size="sm" variant="default" onClick={() => alterarStatus(m.id, "active")}>
                    Aprovar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {motoristas.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum {labelEntidade} cadastrado</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
