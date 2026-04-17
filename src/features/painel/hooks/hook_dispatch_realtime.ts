import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buscarDispatchAtivo } from "../services/servico_painel";
import type { DispatchAtivo } from "../types/tipos_painel";

interface DispatchRow {
  id: string;
  ride_request_id: string;
  driver_id: string;
  response: string;
  dispatched_at: string;
}

const INTERVALO_POLLING_MS = 5000;

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

  // Função que verifica o estado real no banco (rede de segurança)
  const sincronizarComBanco = useCallback(async () => {
    if (!userId) return;
    try {
      const dispatch = await buscarDispatchAtivo(userId);
      if (dispatch) {
        if (dispatch.id !== dispatchIdAtualRef.current) {
          dispatchIdAtualRef.current = dispatch.id;
          setDispatchAtivo(dispatch);
        }
      } else if (dispatchIdAtualRef.current) {
        // Não há mais pending — limpa
        dispatchIdAtualRef.current = null;
        setDispatchAtivo(null);
      }
    } catch {
      // ignora — próximo polling tenta de novo
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let canalAtual: ReturnType<typeof supabase.channel> | null = null;
    let tentativaReconexao = 0;
    let timerReconexao: number | null = null;

    const conectar = () => {
      const canal = supabase
        .channel(`dispatch-driver-${userId}-${Date.now()}`)
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
          if (status === "SUBSCRIBED") {
            setRealtimeAtivo(true);
            tentativaReconexao = 0;
            // Ao (re)conectar, força sync com banco para não perder eventos perdidos
            sincronizarComBanco();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setRealtimeAtivo(false);
            // Auto-reconexão com backoff (max 10s)
            if (timerReconexao) window.clearTimeout(timerReconexao);
            const delay = Math.min(1000 * Math.pow(2, tentativaReconexao), 10000);
            tentativaReconexao++;
            timerReconexao = window.setTimeout(() => {
              if (canalAtual) supabase.removeChannel(canalAtual);
              canalAtual = null;
              conectar();
            }, delay);
          }
        });

      canalAtual = canal;
    };

    conectar();

    // Polling de segurança a cada 5s
    const polling = window.setInterval(() => {
      sincronizarComBanco();
    }, INTERVALO_POLLING_MS);

    // Refresh imediato quando volta do background
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        sincronizarComBanco();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (canalAtual) supabase.removeChannel(canalAtual);
      if (timerReconexao) window.clearTimeout(timerReconexao);
      window.clearInterval(polling);
      document.removeEventListener("visibilitychange", handleVisibility);
      setRealtimeAtivo(false);
    };
  }, [userId, sincronizarComBanco]);

  const limparDispatch = () => {
    dispatchIdAtualRef.current = null;
    setDispatchAtivo(null);
  };

  return { dispatchAtivo, realtimeAtivo, limparDispatch };
}
