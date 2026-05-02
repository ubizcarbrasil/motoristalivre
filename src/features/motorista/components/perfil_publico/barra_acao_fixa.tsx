import { CalendarPlus, MessageCircle, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

type TipoAcao = "agendar" | "orcamento" | "corrida" | "ambos" | "indisponivel";

interface BarraAcaoFixaProps {
  tipo: TipoAcao;
  whatsappDisponivel: boolean;
  onAgendar: () => void;
  onOrcamento: () => void;
  onCorrida: () => void;
}

/**
 * Footer fixo com CTA principal contextual.
 * Estilo iFood: botão verde grande, com sombra superior sutil para
 * separar do conteúdo sem usar borda dura.
 */
export function BarraAcaoFixa({
  tipo,
  whatsappDisponivel,
  onAgendar,
  onOrcamento,
  onCorrida,
}: BarraAcaoFixaProps) {
  if (tipo === "indisponivel") return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)] pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 px-4">
      <div className="max-w-3xl mx-auto">
        {tipo === "ambos" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="lg" className="h-12 gap-2" onClick={onCorrida}>
              <Car className="w-4 h-4" />
              Corrida
            </Button>
            <Button size="lg" className="h-12 gap-2 font-semibold shadow-lg shadow-primary/20" onClick={onAgendar}>
              <CalendarPlus className="w-4 h-4" />
              Agendar
            </Button>
          </div>
        ) : tipo === "agendar" ? (
          <Button
            size="lg"
            className="w-full h-12 gap-2 font-semibold shadow-lg shadow-primary/20"
            onClick={onAgendar}
          >
            <CalendarPlus className="w-4 h-4" />
            Agendar agora
          </Button>
        ) : tipo === "orcamento" ? (
          <Button
            size="lg"
            className="w-full h-12 gap-2 font-semibold shadow-lg shadow-primary/20"
            disabled={!whatsappDisponivel}
            onClick={onOrcamento}
          >
            <MessageCircle className="w-4 h-4" />
            {whatsappDisponivel ? "Solicitar orçamento" : "WhatsApp não cadastrado"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full h-12 gap-2 font-semibold shadow-lg shadow-primary/20"
            onClick={onCorrida}
          >
            <Car className="w-4 h-4" />
            Solicitar corrida
          </Button>
        )}
      </div>
    </div>
  );
}
