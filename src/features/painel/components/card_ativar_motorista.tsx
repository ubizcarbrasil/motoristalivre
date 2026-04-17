import { useState } from "react";
import { Car, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CardAtivarMotoristaProps {
  tenantId: string;
  nomeTribo: string;
  onAtivado: () => void;
}

export function CardAtivarMotorista({ tenantId, nomeTribo, onAtivado }: CardAtivarMotoristaProps) {
  const [carregando, setCarregando] = useState(false);

  async function ativar() {
    setCarregando(true);
    const { error } = await supabase.rpc("ensure_driver_profile", { _tenant_id: tenantId });
    setCarregando(false);

    if (error) {
      toast.error("Não foi possível ativar", { description: error.message });
      return;
    }

    toast.success("Modo motorista ativado!", {
      description: "Agora você pode ficar online e receber corridas.",
    });
    onAtivado();
  }

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Receber corridas em {nomeTribo}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Você é dono desta tribo. Ative o modo motorista para também receber corridas e ficar online.
          </p>
        </div>
      </div>
      <Button onClick={ativar} disabled={carregando} className="w-full" size="sm">
        {carregando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Ativando...
          </>
        ) : (
          "Ativar modo motorista"
        )}
      </Button>
    </div>
  );
}
