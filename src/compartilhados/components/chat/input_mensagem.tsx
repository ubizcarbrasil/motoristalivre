import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InputMensagemProps {
  onEnviar: (texto: string) => void;
  onDigitando: () => void;
}

export function InputMensagem({ onEnviar, onDigitando }: InputMensagemProps) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
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
        onChange={(e) => {
          setTexto(e.target.value);
          if (e.target.value.length > 0) onDigitando();
        }}
        onKeyDown={handleKey}
        placeholder="Mensagem..."
        className="flex-1 h-11 rounded-full bg-secondary border-0"
      />
      <Button
        size="icon"
        onClick={enviar}
        disabled={!texto.trim()}
        className="h-11 w-11 rounded-full shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
