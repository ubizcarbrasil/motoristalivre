import { useState } from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogoDadosVeiculo } from "./dialogo_dados_veiculo";

interface CardAtivarMotoristaProps {
  tenantId: string;
  nomeTribo: string;
  onAtivado: () => void;
}

export function CardAtivarMotorista({ tenantId, nomeTribo, onAtivado }: CardAtivarMotoristaProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
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
        <Button onClick={() => setAberto(true)} className="w-full" size="sm">
          Ativar modo motorista
        </Button>
      </div>

      <DialogoDadosVeiculo
        aberto={aberto}
        onOpenChange={setAberto}
        tenantId={tenantId}
        nomeTribo={nomeTribo}
        onConcluido={onAtivado}
      />
    </>
  );
}
