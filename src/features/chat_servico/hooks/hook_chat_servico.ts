import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MensagemChatServico, IdentidadeChatServico } from "../types/tipos_chat_servico";
import {
  listarMensagens,
  listarMensagensGuest,
  enviarMensagem,
  enviarMensagemGuest,
  marcarMensagensLidas,
  marcarLidasGuest,
} from "../services/servico_chat_servico";

interface UseChatParams {
  bookingId: string | null | undefined;
  tenantId: string | null | undefined;
  identidade: IdentidadeChatServico | null;
}

export function useChatServico({ bookingId, tenantId, identidade }: UseChatParams) {
  const [mensagens, setMensagens] = useState<MensagemChatServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ehGuest = !!identidade?.guest_id;

  const carregar = useCallback(async () => {
    if (!bookingId || !identidade) return;
    setCarregando(true);
    setErro(null);
    try {
      const lista = ehGuest
        ? await listarMensagensGuest(bookingId, identidade.guest_id!)
        : await listarMensagens(bookingId);
      setMensagens(lista);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar mensagens");
    } finally {
      setCarregando(false);
    }
  }, [bookingId, ehGuest, identidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Realtime
  useEffect(() => {
    if (!bookingId) return;
    const canal = supabase
      .channel(`chat_servico:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_booking_messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const nova = payload.new as MensagemChatServico;
            setMensagens((prev) =>
              prev.some((m) => m.id === nova.id) ? prev : [...prev, nova]
            );
          } else if (payload.eventType === "UPDATE") {
            const atual = payload.new as MensagemChatServico;
            setMensagens((prev) => prev.map((m) => (m.id === atual.id ? atual : m)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [bookingId]);

  // Marcar como lidas quando abre/atualiza
  const ultimaMarcacaoRef = useRef<number>(0);
  useEffect(() => {
    if (!bookingId || !identidade || mensagens.length === 0) return;
    const agora = Date.now();
    if (agora - ultimaMarcacaoRef.current < 1500) return;
    ultimaMarcacaoRef.current = agora;
    if (ehGuest) {
      marcarLidasGuest(bookingId, identidade.guest_id!).catch(() => {});
    } else {
      marcarMensagensLidas({ bookingId, meuPapel: identidade.papel }).catch(() => {});
    }
  }, [bookingId, ehGuest, identidade, mensagens.length]);

  const enviar = useCallback(
    async (texto: string) => {
      if (!bookingId || !tenantId || !identidade) return;
      const conteudo = texto.trim();
      if (!conteudo) return;
      setEnviando(true);
      try {
        if (ehGuest) {
          await enviarMensagemGuest({
            bookingId,
            guestId: identidade.guest_id!,
            content: conteudo,
          });
        } else {
          const nova = await enviarMensagem({
            bookingId,
            tenantId,
            papel: identidade.papel,
            senderId: identidade.user_id!,
            content: conteudo,
          });
          setMensagens((prev) => (prev.some((m) => m.id === nova.id) ? prev : [...prev, nova]));
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao enviar mensagem");
      } finally {
        setEnviando(false);
      }
    },
    [bookingId, tenantId, identidade, ehGuest]
  );

  return { mensagens, carregando, enviando, erro, enviar, recarregar: carregar };
}
