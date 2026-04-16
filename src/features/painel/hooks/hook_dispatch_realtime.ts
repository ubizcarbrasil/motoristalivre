import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DispatchAtivo } from "../types/tipos_painel";

interface DispatchRow {
  id: string;
  ride_request_id: string;
  driver_id: string;
  response: string;
  dispatched_at: string;
}

async function carregarDispatchCompleto(dispatchId: string): Promise<DispatchAtivo | null> {
  const { data: dispatch } = await supabase
    .from("ride_dispatches")
    .select("id, ride_request_id, dispatched_at")
    .eq("id", dispatchId)
    .maybeSingle();

  if (!dispatch) return null;

  const { data: req } = await supabase
    .from("ride_requests")
    .select("origin_address, dest_address, distance_km, estimated_min, suggested_price, origin_type, origin_driver_id, origin_affiliate_id")
    .eq("id", dispatch.ride_request_id)
    .maybeSingle();

  if (!req) return null;

  return {
    id: dispatch.id,
    ride_request_id: dispatch.ride_request_id,
    origem_endereco: req.origin_address ?? "—",
    destino_endereco: req.dest_address ?? "—",
    distancia_km: req.distance_km ?? 0,
    duracao_min: req.estimated_min ?? 0,
    valor: req.suggested_price ?? 0,
    origem_tipo: req.origin_type,
    origem_nome: req.origin_driver_id ? "Link de motorista" : req.origin_affiliate_id ? "Link de afiliado" : "Direto",
    dispatched_at: dispatch.dispatched_at,
  };
}

export function useDispatchRealtime(userId: string | undefined, dispatchInicial: DispatchAtivo | null) {
  const [dispatchAtivo, setDispatchAtivo] = useState<DispatchAtivo | null>(dispatchInicial);
  const [realtimeAtivo, setRealtimeAtivo] = useState(false);
  const dispatchIdAtualRef = useRef<string | null>(dispatchInicial?.id ?? null);

  // Sincroniza dispatch inicial vindo do hook pai (após carregamento)
  useEffect(() => {
    if (dispatchInicial && !dispatchIdAtualRef.current) {
      setDispatchAtivo(dispatchInicial);
      dispatchIdAtualRef.current = dispatchInicial.id;
    }
  }, [dispatchInicial]);

  useEffect(() => {
    if (!userId) return;

    const canal = supabase
      .channel(`dispatch-driver-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ride_dispatches",
          filter: `driver_id=eq.${userId}`,
        },
        async (payload) => {
          const row = payload.new as DispatchRow;
          if (row.response !== "pending") return;
          const completo = await carregarDispatchCompleto(row.id);
          if (completo) {
            dispatchIdAtualRef.current = completo.id;
            setDispatchAtivo(completo);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ride_dispatches",
          filter: `driver_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as DispatchRow;
          if (row.id === dispatchIdAtualRef.current && row.response !== "pending") {
            dispatchIdAtualRef.current = null;
            setDispatchAtivo(null);
          }
        }
      )
      .subscribe((status) => {
        setRealtimeAtivo(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(canal);
      setRealtimeAtivo(false);
    };
  }, [userId]);

  const limparDispatch = () => {
    dispatchIdAtualRef.current = null;
    setDispatchAtivo(null);
  };

  return { dispatchAtivo, realtimeAtivo, limparDispatch };
}
