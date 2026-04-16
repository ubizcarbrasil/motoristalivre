import { Button } from "@/components/ui/button";
import { Map, MessageCircle, Phone, MessageSquare } from "lucide-react";

interface BotoesAcaoCorridaProps {
  telefone: string | null;
  onRastrear: () => void;
  onChat: () => void;
}

function limparTelefone(num: string): string {
  return num.replace(/\D/g, "");
}

export function BotoesAcaoCorrida({ telefone, onRastrear, onChat }: BotoesAcaoCorridaProps) {
  const semTelefone = !telefone;
  const numeroLimpo = telefone ? limparTelefone(telefone) : "";

  const acoes = [
    { id: "rastrear", label: "Rastrear", icone: Map, onClick: onRastrear, disabled: false },
    { id: "chat", label: "Chat", icone: MessageCircle, onClick: onChat, disabled: false },
    {
      id: "ligar",
      label: "Ligar",
      icone: Phone,
      onClick: () => { if (telefone) window.location.href = `tel:${numeroLimpo}`; },
      disabled: semTelefone,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icone: MessageSquare,
      onClick: () => { if (telefone) window.open(`https://wa.me/${numeroLimpo}`, "_blank"); },
      disabled: semTelefone,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {acoes.map((acao) => (
        <Button
          key={acao.id}
          variant="outline"
          onClick={acao.onClick}
          disabled={acao.disabled}
          className="h-12 justify-start gap-2"
        >
          <acao.icone className="w-4 h-4" />
          {acao.label}
        </Button>
      ))}
    </div>
  );
}
