import { useEffect, useRef } from "react";
import { useChatRealtime } from "../../hooks/hook_chat_realtime";
import type { PapelChat } from "../../types/tipos_chat";
import { HeaderChat } from "./header_chat";
import { BolhaMensagem } from "./bolha_mensagem";
import { IndicadorDigitando } from "./indicador_digitando";
import { RespostasRapidas } from "./respostas_rapidas";
import { InputMensagem } from "./input_mensagem";

interface TelaChatProps {
  rideId: string;
  meuId: string;
  meuPapel: PapelChat;
  outroNome: string;
  outroAvatar: string | null;
  outroSubtitulo: string;
  outroTelefone: string | null;
  onVoltar: () => void;
}

export function TelaChat({
  rideId,
  meuId,
  meuPapel,
  outroNome,
  outroAvatar,
  outroSubtitulo,
  outroTelefone,
  onVoltar,
}: TelaChatProps) {
  const { mensagens, outroDigitando, enviarMensagem, sinalizarDigitando } = useChatRealtime(
    rideId,
    meuId,
    meuPapel
  );
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, outroDigitando]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <HeaderChat
        nome={outroNome}
        avatarUrl={outroAvatar}
        subtitulo={outroSubtitulo}
        telefone={outroTelefone}
        onVoltar={onVoltar}
      />

      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {mensagens.length === 0 && !outroDigitando && (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center px-8">
              Envie uma mensagem para iniciar a conversa
            </p>
          </div>
        )}

        {mensagens.map((m) => (
          <BolhaMensagem key={m.id} mensagem={m} meuPapel={meuPapel} />
        ))}

        {outroDigitando && <IndicadorDigitando />}

        <div ref={fimRef} />
      </main>

      <RespostasRapidas onSelecionar={enviarMensagem} />
      <InputMensagem onEnviar={enviarMensagem} onDigitando={sinalizarDigitando} />
    </div>
  );
}
