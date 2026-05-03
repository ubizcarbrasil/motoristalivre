import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InputChatProps {
  onEnviar: (texto: string) => void;
  desabilitado?: boolean;
}

export function InputChat({ onEnviar, desabilitado }: InputChatProps) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    const t = texto.trim();
    if (!t || desabilitado) return;
    onEnviar(t);
    setTexto("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-background">
      <Input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Mensagem..."
        disabled={desabilitado}
        className="flex-1 h-11 rounded-full bg-secondary border-0"
      />
      <Button
        size="icon"
        onClick={enviar}
        disabled={!texto.trim() || desabilitado}
        className="h-11 w-11 rounded-full shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
