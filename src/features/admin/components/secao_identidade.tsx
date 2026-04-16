import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { invalidarCacheBranding } from "@/features/perfil_passageiro/services/servico_branding_pdf";

export function SecaoIdentidade() {
  const { usuario } = useAutenticacao();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidade, setCidade] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
    if (!perfil) return;
    setTenantId(perfil.tenant_id);

    const [tenantRes, brandingRes] = await Promise.all([
      supabase.from("tenants").select("name, slug").eq("id", perfil.tenant_id).single(),
      supabase.from("tenant_branding").select("description, city, whatsapp").eq("tenant_id", perfil.tenant_id).single(),
    ]);

    if (tenantRes.data) {
      setNome(tenantRes.data.name);
      setSlug(tenantRes.data.slug);
    }
    if (brandingRes.data) {
      setDescricao(brandingRes.data.description || "");
      setCidade(brandingRes.data.city || "");
      setWhatsapp(brandingRes.data.whatsapp || "");
    }
  }

  async function salvar() {
    if (!tenantId) return;
    setSalvando(true);
    try {
      await supabase.from("tenant_branding").update({ description: descricao, city: cidade, whatsapp }).eq("tenant_id", tenantId);
      invalidarCacheBranding(tenantId);
      toast.success("Identidade atualizada");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Label>Nome do grupo</Label>
        <Input value={nome} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">O nome nao pode ser alterado</p>
      </div>
      <div className="space-y-2">
        <Label>Subdominio (slug)</Label>
        <Input value={slug} disabled className="opacity-60" />
      </div>
      <div className="space-y-2">
        <Label>Descricao</Label>
        <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descricao do grupo" />
      </div>
      <div className="space-y-2">
        <Label>Cidade</Label>
        <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade de atuacao" />
      </div>
      <div className="space-y-2">
        <Label>WhatsApp</Label>
        <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5511999999999" />
      </div>
      <Button onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar alteracoes"}
      </Button>
    </div>
  );
}
