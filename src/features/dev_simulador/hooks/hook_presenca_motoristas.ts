import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Detecta quais motoristas (driver IDs) estão com o painel aberto agora,
 * baseado no canal de presença `dispatch-presence` que o painel publica.
 */
export function usePresencaMotoristas() {
  const [idsConectados, setIdsConectados] = useState<Set<string>>(new Set());

  useEffect(() => {
    const canal = supabase.channel("dispatch-presence", {
      config: { presence: { key: "observer" } },
    });

    const atualizarSet = () => {
      const estado = canal.presenceState<{ driver_id: string }>();
      const ids = new Set<string>();
      Object.values(estado).forEach((entradas) => {
        entradas.forEach((e) => {
          if (e.driver_id) ids.add(e.driver_id);
        });
      });
      setIdsConectados(ids);
    };

    canal
      .on("presence", { event: "sync" }, atualizarSet)
      .on("presence", { event: "join" }, atualizarSet)
      .on("presence", { event: "leave" }, atualizarSet)
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return idsConectados;
}
