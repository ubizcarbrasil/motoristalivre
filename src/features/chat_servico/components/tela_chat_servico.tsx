import { useEffect, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatServico } from "../hooks/hook_chat_servico";
import type { IdentidadeChatServico } from "../types/tipos_chat_servico";
import { BolhaMensagemChat } from "./bolha_mensagem_chat";
import { InputChat } from "./input_chat";

interface TelaChatServicoProps {
  bookingId: string;
  tenantId: string;
  identidade: IdentidadeChatServico;
  tituloOutro: string;
  subtituloOutro?: string;
  avatarOutro?: string | null;
  onVoltar: () => void;
}

export function TelaChatServico({
  bookingId,
  tenantId,
  identidade,
  tituloOutro,
  subtituloOutro,
  avatarOutro,
  onVoltar,
}: TelaChatServicoProps) {
  const { mensagens, carregando, enviando, erro, enviar } = useChatServico({
    bookingId,
    tenantId,
    identidade,
  });
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  const inicial = tituloOutro.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-3 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
        <Button size="icon" variant="ghost" onClick={onVoltar} className="shrink-0 h-9 w-9">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
          {avatarOutro ? (
            <img src={avatarOutro} alt={tituloOutro} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-foreground">{inicial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{tituloOutro}</p>
          {subtituloOutro && (
            <p className="text-xs text-muted-foreground truncate">{subtituloOutro}</p>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {carregando ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : mensagens.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center px-8">
              Envie uma mensagem para iniciar a conversa
            </p>
          </div>
        ) : (
          mensagens.map((m) => (
            <BolhaMensagemChat key={m.id} mensagem={m} meuPapel={identidade.papel} />
          ))
        )}
        <div ref={fimRef} />
      </main>

      {erro && (
        <p className="px-3 py-1 text-[11px] text-destructive bg-destructive/10">{erro}</p>
      )}

      <InputChat onEnviar={enviar} desabilitado={enviando} />
    </div>
  );
}
