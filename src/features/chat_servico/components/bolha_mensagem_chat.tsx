import { cn } from "@/lib/utils";
import type { MensagemChatServico, PapelChatServico } from "../types/tipos_chat_servico";

interface BolhaMensagemChatProps {
  mensagem: MensagemChatServico;
  meuPapel: PapelChatServico;
}

function formatarHora(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function BolhaMensagemChat({ mensagem, meuPapel }: BolhaMensagemChatProps) {
  const ehMinha = mensagem.sender_role === meuPapel;

  return (
    <div className={cn("flex w-full", ehMinha ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 break-words",
          ehMinha
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary text-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm leading-snug whitespace-pre-wrap">{mensagem.content}</p>
        <p
          className={cn(
            "text-[10px] mt-0.5 text-right",
            ehMinha ? "opacity-70" : "text-muted-foreground"
          )}
        >
          {formatarHora(mensagem.created_at)}
          {ehMinha && mensagem.read_at ? " ✓✓" : ehMinha ? " ✓" : ""}
        </p>
      </div>
    </div>
  );
}
