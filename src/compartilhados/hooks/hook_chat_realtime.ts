import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MensagemChat, PapelChat } from "../types/tipos_chat";

const TYPING_TIMEOUT_MS = 2500;

export function useChatRealtime(
  rideId: string | null | undefined,
  meuId: string | null | undefined,
  meuPapel: PapelChat
) {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [outroDigitando, setOutroDigitando] = useState(false);
  const [conectado, setConectado] = useState(false);
  const canalRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  useEffect(() => {
    if (!rideId || !meuId) return;

    const canal = supabase.channel(`chat:${rideId}`, {
      config: { broadcast: { self: false } },
    });

    canal
      .on("broadcast", { event: "message" }, (msg) => {
        const m = msg.payload as MensagemChat;
        setMensagens((prev) =>
          prev.some((x) => x.id === m.id) ? prev : [...prev, m]
        );
      })
      .on("broadcast", { event: "typing" }, (msg) => {
        const senderId = (msg.payload as { sender_id: string }).sender_id;
        if (senderId === meuId) return;
        setOutroDigitando(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setOutroDigitando(false), TYPING_TIMEOUT_MS);
      })
      .subscribe((st) => setConectado(st === "SUBSCRIBED"));

    canalRef.current = canal;

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      supabase.removeChannel(canal);
      canalRef.current = null;
      setConectado(false);
    };
  }, [rideId, meuId]);

  const enviarMensagem = useCallback(
    (texto: string) => {
      if (!rideId || !meuId || !canalRef.current) return;
      const conteudo = texto.trim();
      if (!conteudo) return;

      const msg: MensagemChat = {
        id: crypto.randomUUID(),
        ride_id: rideId,
        sender_id: meuId,
        sender_role: meuPapel,
        content: conteudo,
        timestamp: Date.now(),
      };

      // Optimistic local append
      setMensagens((prev) => [...prev, msg]);

      canalRef.current.send({
        type: "broadcast",
        event: "message",
        payload: msg,
      });
    },
    [rideId, meuId, meuPapel]
  );

  const sinalizarDigitando = useCallback(() => {
    if (!canalRef.current || !meuId) return;
    const agora = Date.now();
    // throttle: 1 typing event a cada 1.5s
    if (agora - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = agora;
    canalRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { sender_id: meuId },
    });
  }, [meuId]);

  return { mensagens, outroDigitando, conectado, enviarMensagem, sinalizarDigitando };
}
