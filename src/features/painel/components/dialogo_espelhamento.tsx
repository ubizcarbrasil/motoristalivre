import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { enviarConviteEspelhamento } from "../services/servico_espelhamento_equipe";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  tenantId: string;
  ownerDriverId: string;
  membroId: string;
  membroNome: string;
}

export function DialogoEspelhamento({
  aberto,
  onFechar,
  tenantId,
  ownerDriverId,
  membroId,
  membroNome,
}: Props) {
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setEnviando(true);
    try {
      await enviarConviteEspelhamento({
        tenant_id: tenantId,
        inviter_driver_id: ownerDriverId,
        invitee_driver_id: membroId,
        message: mensagem.trim() || null,
      });
      toast.success("Convite enviado!", {
        description: `${membroNome} receberá o pedido para espelhar você na equipe.`,
      });
      setMensagem("");
      onFechar();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar convite");
    } finally {
      setEnviando(false);
    }
  };

  const pular = () => {
    setMensagem("");
    onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && pular()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Pedir espelhamento?
          </DialogTitle>
          <DialogDescription>
            Você adicionou <span className="font-medium text-foreground">{membroNome}</span> à
            sua equipe. Quer pedir para ele(a) também te incluir na equipe dele(a)?
            Cada profissional mantém sua própria agenda e seus preços.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-xs text-muted-foreground">
            Mensagem (opcional)
          </label>
          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Ex: Vamos crescer juntos indicando um ao outro!"
            maxLength={240}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={pular} disabled={enviando}>
            Agora não
          </Button>
          <Button onClick={enviar} disabled={enviando} className="gap-2">
            {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar convite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
