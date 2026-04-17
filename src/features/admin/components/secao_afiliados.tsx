import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Afiliado {
  id: string;
  slug: string;
  nomeEstabelecimento: string | null;
  tipo: string | null;
  corridasGeradas: number;
  ganhos: number;
  aprovado: boolean;
}

export function SecaoAfiliados() {
  const { usuario } = useAutenticacao();
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
      if (!perfil) return;

      const { data: affiliates } = await supabase
        .from("affiliates")
        .select("id, slug, business_name, business_type, is_approved")
        .eq("tenant_id", perfil.tenant_id);

      setAfiliados(
        (affiliates || []).map((a) => ({
          id: a.id,
          slug: a.slug,
          nomeEstabelecimento: a.business_name,
          tipo: a.business_type,
          corridasGeradas: 0,
          ganhos: 0,
          aprovado: a.is_approved,
        }))
      );
    } finally {
      setCarregando(false);
    }
  }

  async function aprovar(id: string) {
    const { error } = await supabase.from("affiliates").update({ is_approved: true }).eq("id", id);
    if (error) {
      toast.error("Erro ao aprovar afiliado");
      return;
    }
    toast.success("Afiliado aprovado");
    carregar();
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6">
      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {afiliados.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{a.nomeEstabelecimento || a.slug}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.tipo || "—"}</p>
              </div>
              <Badge variant={a.aprovado ? "default" : "secondary"} className="shrink-0">
                {a.aprovado ? "Aprovado" : "Pendente"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Corridas</p>
                <p className="text-foreground font-medium">{a.corridasGeradas}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ganhos</p>
                <p className="text-foreground font-medium">R$ {a.ganhos.toFixed(2)}</p>
              </div>
            </div>
            {!a.aprovado && (
              <Button size="sm" className="w-full" onClick={() => aprovar(a.id)}>Aprovar</Button>
            )}
          </div>
        ))}
        {afiliados.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum afiliado cadastrado</p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estabelecimento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Corridas</TableHead>
            <TableHead>Ganhos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {afiliados.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium text-foreground">{a.nomeEstabelecimento || a.slug}</TableCell>
              <TableCell className="text-muted-foreground">{a.tipo || "—"}</TableCell>
              <TableCell>{a.corridasGeradas}</TableCell>
              <TableCell>R$ {a.ganhos.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={a.aprovado ? "default" : "secondary"}>
                  {a.aprovado ? "Aprovado" : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell>
                {!a.aprovado && (
                  <Button size="sm" onClick={() => aprovar(a.id)}>Aprovar</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {afiliados.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum afiliado cadastrado</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
