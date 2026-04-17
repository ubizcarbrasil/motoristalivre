import { useState } from "react";
import { Loader2, Car } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { schemaVeiculo } from "../schemas/schema_veiculo";

interface DialogoDadosVeiculoProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  tenantId: string;
  nomeTribo: string;
  onConcluido: () => void;
}

export function DialogoDadosVeiculo({
  aberto,
  onOpenChange,
  tenantId,
  nomeTribo,
  onConcluido,
}: DialogoDadosVeiculoProps) {
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [cor, setCor] = useState("");
  const [ano, setAno] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  function resetar() {
    setModelo("");
    setPlaca("");
    setCor("");
    setAno("");
    setErros({});
  }

  async function salvar() {
    setErros({});
    const parsed = schemaVeiculo.safeParse({
      vehicle_model: modelo,
      vehicle_plate: placa,
      vehicle_color: cor,
      vehicle_year: ano,
    });

    if (!parsed.success) {
      const novos: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as string;
        novos[k] = i.message;
      });
      setErros(novos);
      return;
    }

    setSalvando(true);

    // 1. Cria perfil de motorista na tribo
    const { data: driverId, error: errAtivar } = await supabase.rpc("ensure_driver_profile", {
      _tenant_id: tenantId,
    });

    if (errAtivar || !driverId) {
      setSalvando(false);
      toast.error("Não foi possível ativar", { description: errAtivar?.message });
      return;
    }

    // 2. Salva dados do veículo
    const { error: errVeiculo } = await supabase
      .from("drivers")
      .update({
        vehicle_model: parsed.data.vehicle_model,
        vehicle_plate: parsed.data.vehicle_plate,
        vehicle_color: parsed.data.vehicle_color,
        vehicle_year: parsed.data.vehicle_year ? Number(parsed.data.vehicle_year) : null,
      })
      .eq("id", driverId);

    setSalvando(false);

    if (errVeiculo) {
      toast.error("Modo motorista criado, mas falhou ao salvar veículo", {
        description: errVeiculo.message,
      });
      onConcluido();
      return;
    }

    toast.success("Tudo pronto!", {
      description: "Agora você pode ficar online e receber corridas.",
    });
    resetar();
    onOpenChange(false);
    onConcluido();
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        if (!salvando) {
          if (!v) resetar();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle>Dados do seu veículo</DialogTitle>
          <DialogDescription>
            Para receber corridas em {nomeTribo}, informe os dados do carro que vai usar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              placeholder="Ex.: Honda Civic"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              maxLength={60}
              disabled={salvando}
            />
            {erros.vehicle_model && (
              <p className="text-xs text-destructive">{erros.vehicle_model}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                placeholder="ABC1D23"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                maxLength={10}
                disabled={salvando}
              />
              {erros.vehicle_plate && (
                <p className="text-xs text-destructive">{erros.vehicle_plate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ano">Ano (opcional)</Label>
              <Input
                id="ano"
                placeholder="2020"
                value={ano}
                onChange={(e) => setAno(e.target.value.replace(/\D/g, ""))}
                maxLength={4}
                disabled={salvando}
              />
              {erros.vehicle_year && (
                <p className="text-xs text-destructive">{erros.vehicle_year}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cor">Cor</Label>
            <Input
              id="cor"
              placeholder="Ex.: Prata"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              maxLength={30}
              disabled={salvando}
            />
            {erros.vehicle_color && (
              <p className="text-xs text-destructive">{erros.vehicle_color}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button className="flex-1" onClick={salvar} disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Ativar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
