import { cn } from "@/lib/utils";
import type { MensagemChat, PapelChat } from "../../types/tipos_chat";

interface BolhaMensagemProps {
  mensagem: MensagemChat;
  meuPapel: PapelChat;
}

function formatarHora(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function BolhaMensagem({ mensagem, meuPapel }: BolhaMensagemProps) {
  const ehMinha = mensagem.sender_role === meuPapel;

  return (
    <div className={cn("flex w-full", ehMinha ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 break-words",
          ehMinha
            ? "bg-white text-black rounded-br-sm"
            : "bg-[#1c1c1c] text-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm leading-snug whitespace-pre-wrap">{mensagem.content}</p>
        <p
          className={cn(
            "text-[10px] mt-0.5 text-right",
            ehMinha ? "text-black/50" : "text-muted-foreground"
          )}
        >
          {formatarHora(mensagem.timestamp)}
        </p>
      </div>
    </div>
  );
}
