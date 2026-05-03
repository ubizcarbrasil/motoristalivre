import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { IdentidadeChatServico, MensagemChatServico } from "../types/tipos_chat_servico";
import { listarMensagensGuest } from "../services/servico_chat_servico";

interface Params {
  bookingId: string | null | undefined;
  identidade: IdentidadeChatServico | null;
}

/**
 * Conta mensagens não lidas vindas do "outro lado" do chat.
 * Atualiza em tempo real via postgres_changes.
 */
export function useNaoLidasChat({ bookingId, identidade }: Params) {
  const [naoLidas, setNaoLidas] = useState(0);
  const ehGuest = !!identidade?.guest_id;
  const meuPapel = identidade?.papel;
  const outroPapel = meuPapel === "client" ? "driver" : "client";

  const carregar = useCallback(async () => {
    if (!bookingId || !identidade) return;
    try {
      if (ehGuest) {
        const lista = await listarMensagensGuest(bookingId, identidade.guest_id!);
        const count = lista.filter(
          (m) => m.sender_role === outroPapel && !m.read_at,
        ).length;
        setNaoLidas(count);
      } else {
        const { count } = await supabase
          .from("service_booking_messages")
          .select("id", { count: "exact", head: true })
          .eq("booking_id", bookingId)
          .eq("sender_role", outroPapel)
          .is("read_at", null);
        setNaoLidas(count ?? 0);
      }
    } catch {
      // silencioso — badge é não-crítico
    }
  }, [bookingId, identidade, ehGuest, outroPapel]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!bookingId) return;
    const canal = supabase
      .channel(`chat_naolidas:${bookingId}`)
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
            if (nova.sender_role === outroPapel && !nova.read_at) {
              setNaoLidas((n) => n + 1);
            }
          } else if (payload.eventType === "UPDATE") {
            // Recarrega para refletir read_at corretamente
            carregar();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [bookingId, outroPapel, carregar]);

  return { naoLidas, recarregar: carregar };
}
