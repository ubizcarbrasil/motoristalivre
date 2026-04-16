import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LogAuditoria } from "../types/tipos_root";

const TIPO_CORES: Record<string, string> = {
  CREATE: "default",
  PAYOUT: "secondary",
  BILLING: "outline",
  AFFILIATE: "destructive",
};

export function SecaoAuditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const { data } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, user_id, created_at, payload")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!data) return;

      const userIds = [...new Set(data.map((l) => l.user_id).filter(Boolean))] as string[];
      const { data: users } = userIds.length > 0
        ? await supabase.from("users").select("id, full_name").in("id", userIds)
        : { data: [] };
      const userMap = new Map((users || []).map((u) => [u.id, u.full_name]));

      setLogs(data.map((l) => ({
        id: l.id,
        acao: l.action,
        tipoEntidade: l.entity_type,
        usuarioNome: l.user_id ? userMap.get(l.user_id) || null : null,
        timestamp: l.created_at,
        payload: l.payload as Record<string, unknown> | null,
      })));
    } finally { setCarregando(false); }
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Acao</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium text-foreground">{l.acao}</TableCell>
              <TableCell>
                <Badge variant={(TIPO_CORES[l.tipoEntidade || ""] as "default" | "secondary" | "outline" | "destructive") || "secondary"}>
                  {l.tipoEntidade || "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{l.usuarioNome || "Sistema"}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(l.timestamp).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                {l.payload ? JSON.stringify(l.payload) : "—"}
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum log</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
