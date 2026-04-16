import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SecaoComissoes() {
  const { usuario } = useAutenticacao();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [transbordo, setTransbordo] = useState(10);
  const [afiliado, setAfiliado] = useState(5);
  const [cashback, setCashback] = useState(0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
    if (!perfil) return;
    setTenantId(perfil.tenant_id);

    const { data } = await supabase.from("tenant_settings").select("transbordo_commission, affiliate_commission, cashback_pct").eq("tenant_id", perfil.tenant_id).single();
    if (data) {
      setTransbordo(data.transbordo_commission);
      setAfiliado(data.affiliate_commission);
      setCashback(data.cashback_pct);
    }
  }

  async function salvar() {
    if (!tenantId) return;
    setSalvando(true);
    try {
      await supabase.from("tenant_settings").update({
        transbordo_commission: transbordo,
        affiliate_commission: afiliado,
        cashback_pct: cashback,
      }).eq("tenant_id", tenantId);
      toast.success("Comissoes atualizadas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Label>Comissao de transbordo (%)</Label>
        <Input type="number" value={transbordo} onChange={(e) => setTransbordo(Number(e.target.value))} min={0} max={100} />
        <p className="text-xs text-muted-foreground">Percentual cobrado quando um motorista atende corrida de outro</p>
      </div>

      <div className="space-y-2">
        <Label>Comissao de afiliado (%)</Label>
        <Input type="number" value={afiliado} onChange={(e) => setAfiliado(Number(e.target.value))} min={0} max={100} />
        <p className="text-xs text-muted-foreground">Percentual pago ao afiliado por corrida gerada</p>
      </div>

      <div className="space-y-2">
        <Label>Cashback padrao (%)</Label>
        <Input type="number" value={cashback} onChange={(e) => setCashback(Number(e.target.value))} min={0} max={100} />
        <p className="text-xs text-muted-foreground">Percentual de cashback devolvido ao passageiro</p>
      </div>

      <Button onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar comissoes"}
      </Button>
    </div>
  );
}
