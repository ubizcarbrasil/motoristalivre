import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MessageSquare } from "lucide-react";

interface HeaderChatProps {
  nome: string;
  avatarUrl: string | null;
  subtitulo: string;
  telefone: string | null;
  onVoltar: () => void;
}

function limparTel(t: string): string {
  return t.replace(/\D/g, "");
}

export function HeaderChat({ nome, avatarUrl, subtitulo, telefone, onVoltar }: HeaderChatProps) {
  const semTel = !telefone;
  const num = telefone ? limparTel(telefone) : "";

  const inicial = nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="flex items-center gap-3 px-3 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
      <Button size="icon" variant="ghost" onClick={onVoltar} className="shrink-0 h-9 w-9">
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-foreground">{inicial}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{nome}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitulo}</p>
      </div>

      <Button
        size="icon"
        variant="ghost"
        disabled={semTel}
        className="h-9 w-9 shrink-0"
        onClick={() => { if (telefone) window.location.href = `tel:${num}`; }}
      >
        <Phone className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        disabled={semTel}
        className="h-9 w-9 shrink-0"
        onClick={() => { if (telefone) window.open(`https://wa.me/${num}`, "_blank"); }}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    </header>
  );
}
