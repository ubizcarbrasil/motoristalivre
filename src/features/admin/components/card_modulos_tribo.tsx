import { useEffect, useState } from "react";
import { Car, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CardModulosTriboProps {
  tenantId: string;
}

type Modulo = "mobility" | "services";

export function CardModulosTribo({ tenantId }: CardModulosTriboProps) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("id", tenantId)
        .maybeSingle();
      if (!ativo) return;
      setModulos(((data?.active_modules ?? []) as Modulo[]).filter((m) =>
        ["mobility", "services"].includes(m),
      ));
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [tenantId]);

  const tem = (m: Modulo) => modulos.includes(m);

  const alternar = (m: Modulo, ligado: boolean) => {
    setModulos((prev) => {
      const set = new Set(prev);
      if (ligado) set.add(m);
      else set.delete(m);
      return Array.from(set) as Modulo[];
    });
  };

  const salvar = async () => {
    if (modulos.length === 0) {
      toast.error("Ative pelo menos um módulo");
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase
        .from("tenants")
        .update({ active_modules: modulos })
        .eq("id", tenantId);
      if (error) throw error;
      toast.success("Módulos atualizados. Recarregue a página para ver as mudanças.");
    } catch {
      toast.error("Erro ao salvar módulos");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando módulos...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Módulos da tribo</h3>
        <p className="text-[11px] text-muted-foreground">
          Escolha quais funcionalidades aparecem no painel e na vitrine pública.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium text-foreground cursor-pointer">
                Mobilidade
              </Label>
              <Switch
                checked={tem("mobility")}
                onCheckedChange={(v) => alternar("mobility", v)}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              Corridas, motoristas, afiliados, comissões e despacho.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium text-foreground cursor-pointer">
                Serviços
              </Label>
              <Switch
                checked={tem("services")}
                onCheckedChange={(v) => alternar("services", v)}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              Agendamentos, portfólio, equipe e profissionais.
            </p>
          </div>
        </label>
      </div>

      <Button onClick={salvar} disabled={salvando} className="w-full h-11">
        {salvando ? "Salvando..." : "Salvar módulos"}
      </Button>
    </div>
  );
}
