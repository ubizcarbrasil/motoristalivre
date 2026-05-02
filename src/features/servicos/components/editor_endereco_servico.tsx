import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { atualizarServico } from "@/features/servicos/services/servico_servicos";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";

interface EditorEnderecoServicoProps {
  servico: TipoServico | null;
  aberto: boolean;
  onFechar: () => void;
  onSalvo: () => void;
}

interface FormEndereco {
  requires_address: boolean;
  service_radius_km: string;
  travel_fee_base: string;
  travel_fee_per_km: string;
}

const formularioInicial: FormEndereco = {
  requires_address: false,
  service_radius_km: "",
  travel_fee_base: "0",
  travel_fee_per_km: "0",
};

export function EditorEnderecoServico({
  servico,
  aberto,
  onFechar,
  onSalvo,
}: EditorEnderecoServicoProps) {
  const [form, setForm] = useState<FormEndereco>(formularioInicial);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (servico) {
      setForm({
        requires_address: !!servico.requires_address,
        service_radius_km:
          servico.service_radius_km != null ? String(servico.service_radius_km) : "",
        travel_fee_base:
          servico.travel_fee_base != null ? String(servico.travel_fee_base) : "0",
        travel_fee_per_km:
          servico.travel_fee_per_km != null ? String(servico.travel_fee_per_km) : "0",
      });
    } else {
      setForm(formularioInicial);
    }
  }, [servico]);

  const atualizarCampo = <K extends keyof FormEndereco>(chave: K, valor: FormEndereco[K]) => {
    setForm((anterior) => ({ ...anterior, [chave]: valor }));
  };

  const salvar = async () => {
    if (!servico) return;
    setSalvando(true);
    try {
      await atualizarServico(servico.id, {
        requires_address: form.requires_address,
        service_radius_km: form.service_radius_km
          ? Number(form.service_radius_km)
          : null,
        travel_fee_base: Number(form.travel_fee_base) || 0,
        travel_fee_per_km: Number(form.travel_fee_per_km) || 0,
      } as Partial<TipoServico>);
      toast.success("Configuração de atendimento salva");
      onSalvo();
      onFechar();
    } catch (erro: any) {
      toast.error(erro?.message ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Endereço e deslocamento
          </DialogTitle>
          <DialogDescription>
            {servico ? servico.name : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <div className="space-y-0.5">
              <Label htmlFor="exige_endereco" className="cursor-pointer">
                Exige endereço de atendimento
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Cliente preenche o local onde o serviço será prestado.
              </p>
            </div>
            <Switch
              id="exige_endereco"
              checked={form.requires_address}
              onCheckedChange={(v) => atualizarCampo("requires_address", v)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="raio_km">Raio de atendimento (km)</Label>
            <Input
              id="raio_km"
              type="number"
              min={0}
              step={1}
              placeholder="Sem limite"
              value={form.service_radius_km}
              disabled={!form.requires_address}
              onChange={(e) => atualizarCampo("service_radius_km", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Deixe vazio para não limitar a distância.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="taxa_base">Taxa base (R$)</Label>
              <Input
                id="taxa_base"
                type="number"
                min={0}
                step={0.01}
                value={form.travel_fee_base}
                disabled={!form.requires_address}
                onChange={(e) => atualizarCampo("travel_fee_base", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxa_km">Taxa por km (R$)</Label>
              <Input
                id="taxa_km"
                type="number"
                min={0}
                step={0.01}
                value={form.travel_fee_per_km}
                disabled={!form.requires_address}
                onChange={(e) => atualizarCampo("travel_fee_per_km", e.target.value)}
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            O deslocamento será somado ao preço final apresentado ao cliente no momento do agendamento.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !servico}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
