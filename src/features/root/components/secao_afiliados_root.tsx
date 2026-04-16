import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AfiliadoGlobal } from "../types/tipos_root";

export function SecaoAfiliadosRoot() {
  const [afiliados, setAfiliados] = useState<AfiliadoGlobal[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const { data: affiliates } = await supabase
        .from("affiliates")
        .select("id, slug, business_name, is_approved, tenant_id");

      if (!affiliates) return;

      const tenantIds = [...new Set(affiliates.map((a) => a.tenant_id))];
      const { data: tenants } = await supabase.from("tenants").select("id, name").in("id", tenantIds);
      const tenantMap = new Map((tenants || []).map((t) => [t.id, t.name]));

      setAfiliados(affiliates.map((a) => ({
        id: a.id, slug: a.slug,
        nomeEstabelecimento: a.business_name,
        tenantNome: tenantMap.get(a.tenant_id) || "—",
        corridasGeradas: 0, comissoes: 0,
        aprovado: a.is_approved,
      })));
    } finally { setCarregando(false); }
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estabelecimento</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Corridas</TableHead>
            <TableHead>Comissoes</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {afiliados.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium text-foreground">{a.nomeEstabelecimento || a.slug}</TableCell>
              <TableCell className="text-muted-foreground">{a.tenantNome}</TableCell>
              <TableCell>{a.corridasGeradas}</TableCell>
              <TableCell>R$ {a.comissoes.toFixed(2)}</TableCell>
              <TableCell><Badge variant={a.aprovado ? "default" : "secondary"}>{a.aprovado ? "Aprovado" : "Pendente"}</Badge></TableCell>
            </TableRow>
          ))}
          {afiliados.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum afiliado</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
