import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Publica a presença do motorista no canal `dispatch-presence`.
 * Permite que o simulador (ou qualquer admin) veja em tempo real quais
 * motoristas estão com o painel aberto agora.
 */
export function usePublicarPresencaMotorista(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    const canal = supabase.channel("dispatch-presence", {
      config: { presence: { key: userId } },
    });

    canal.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await canal.track({
          driver_id: userId,
          conectado_em: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(canal);
    };
  }, [userId]);
}
