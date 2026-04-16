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

export function SecaoMotoristas() {
  const { usuario } = useAutenticacao();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      const { data: drivers } = await supabase
        .from("drivers")
        .select("id, slug, is_online, is_verified")
        .eq("tenant_id", perfil.tenant_id);

      if (!drivers) return;

      const ids = drivers.map((d) => d.id);
      const { data: users } = await supabase.from("users").select("id, full_name, status").in("id", ids);

      const { data: rides } = await supabase
        .from("rides")
        .select("driver_id")
        .eq("tenant_id", perfil.tenant_id);

      setMotoristas(
        drivers.map((d) => {
          const u = users?.find((u) => u.id === d.id);
          return {
            id: d.id,
            slug: d.slug,
            nome: u?.full_name || d.slug,
            corridasTotal: rides?.filter((r) => r.driver_id === d.id).length || 0,
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
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Corridas</TableHead>
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
              <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum motorista cadastrado</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
