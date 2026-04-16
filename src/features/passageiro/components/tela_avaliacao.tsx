import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SeletorEstrelas } from "./seletor_estrelas";
import { enviarAvaliacao, buscarTenantDaCorrida } from "../services/servico_avaliacao";

interface TelaAvaliacaoProps {
  rideId: string;
  driverId: string;
  passengerId: string;
  motoristaNome: string;
  motoristaAvatar: string | null;
  onConcluir: () => void;
}

export function TelaAvaliacao({
  rideId,
  driverId,
  passengerId,
  motoristaNome,
  motoristaAvatar,
  onConcluir,
}: TelaAvaliacaoProps) {
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const inicial = motoristaNome.trim().charAt(0).toUpperCase() || "?";

  const handleEnviar = async () => {
    if (estrelas < 1) {
      toast.error("Selecione de 1 a 5 estrelas");
      return;
    }
    setEnviando(true);
    try {
      const tenantId = await buscarTenantDaCorrida(rideId);
      if (!tenantId) throw new Error("Corrida não encontrada");

      await enviarAvaliacao({
        ride_id: rideId,
        driver_id: driverId,
        passenger_id: passengerId,
        tenant_id: tenantId,
        rating: estrelas,
        comment: comentario,
      });
      toast.success("Avaliação enviada");
      onConcluir();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <main className="flex-1 overflow-y-auto px-6 pt-12 pb-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden flex items-center justify-center mb-4">
          {motoristaAvatar ? (
            <img src={motoristaAvatar} alt={motoristaNome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-foreground">{inicial}</span>
          )}
        </div>

        <h1 className="text-lg font-semibold text-center text-foreground">
          Como foi a corrida com {motoristaNome}?
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1 mb-8">
          Sua avaliação ajuda a melhorar o serviço
        </p>

        <SeletorEstrelas valor={estrelas} onMudar={setEstrelas} />

        <div className="w-full max-w-md mt-8">
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Deixe um comentário (opcional)"
            rows={4}
            className="resize-none bg-secondary border-0"
            maxLength={500}
          />
        </div>
      </main>

      <footer className="px-6 pb-8 pt-3 space-y-2 border-t border-border bg-background">
        <Button
          onClick={handleEnviar}
          disabled={enviando || estrelas < 1}
          className="w-full h-12 text-sm font-semibold"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar avaliação"}
        </Button>
        <Button
          onClick={onConcluir}
          disabled={enviando}
          variant="ghost"
          className="w-full h-11 text-sm text-muted-foreground"
        >
          Pular
        </Button>
      </footer>
    </div>
  );
}
