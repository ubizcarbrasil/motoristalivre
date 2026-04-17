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

const INTERVALO_POLLING_RAPIDO_MS = 5000;
const INTERVALO_POLLING_LENTO_MS = 15000;
const TEMPO_ESTAVEL_PARA_LENTO_MS = 30000;
const DEBOUNCE_OFFLINE_MS = 3000;

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
  const sincronizarRef = useRef<() => Promise<void>>(async () => {});

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
        dispatchIdAtualRef.current = null;
        setDispatchAtivo(null);
      }
    } catch {
      // ignora — próximo polling tenta de novo
    }
  }, [userId]);

  // Mantém ref atualizada pra ser usada dentro do effect sem virar dependência
  useEffect(() => {
    sincronizarRef.current = sincronizarComBanco;
  }, [sincronizarComBanco]);

  useEffect(() => {
    if (!userId) return;

    let canalAtual: ReturnType<typeof supabase.channel> | null = null;
    let tentativaReconexao = 0;
    let timerReconexao: number | null = null;
    let timerOffline: number | null = null;
    let timerPolling: number | null = null;
    let conectadoDesde: number | null = null;
    let cancelado = false;

    const log = (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.log("[realtime-dispatch]", ...args);
    };

    const marcarOnline = () => {
      if (timerOffline) {
        window.clearTimeout(timerOffline);
        timerOffline = null;
      }
      setRealtimeAtivo(true);
    };

    const marcarOfflineComDebounce = () => {
      if (timerOffline) return;
      timerOffline = window.setTimeout(() => {
        timerOffline = null;
        if (!cancelado) setRealtimeAtivo(false);
      }, DEBOUNCE_OFFLINE_MS);
    };

    const agendarPolling = () => {
      if (timerPolling) window.clearInterval(timerPolling);
      const intervalo =
        conectadoDesde && Date.now() - conectadoDesde > TEMPO_ESTAVEL_PARA_LENTO_MS
          ? INTERVALO_POLLING_LENTO_MS
          : INTERVALO_POLLING_RAPIDO_MS;
      timerPolling = window.setInterval(() => {
        sincronizarRef.current();
        // Reagenda pra ajustar intervalo conforme estabilidade
        agendarPolling();
      }, intervalo);
    };

    const conectar = () => {
      if (cancelado) return;
      log("conectando…");

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
            log("INSERT recebido", row.id, row.response);
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
            log("UPDATE recebido", row.id, row.response);
            if (row.id === dispatchIdAtualRef.current && row.response !== "pending") {
              dispatchIdAtualRef.current = null;
              setDispatchAtivo(null);
            }
          }
        )
        .subscribe((status) => {
          log("status:", status);
          if (cancelado) return;

          if (status === "SUBSCRIBED") {
            tentativaReconexao = 0;
            conectadoDesde = Date.now();
            marcarOnline();
            sincronizarRef.current();
            agendarPolling();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            conectadoDesde = null;
            marcarOfflineComDebounce();
            if (timerReconexao) window.clearTimeout(timerReconexao);
            const delay = Math.min(2000 * Math.pow(1.5, tentativaReconexao), 15000);
            tentativaReconexao++;
            log(`reconectando em ${Math.round(delay)}ms (tentativa ${tentativaReconexao})`);
            timerReconexao = window.setTimeout(() => {
              if (canalAtual) {
                supabase.removeChannel(canalAtual);
                canalAtual = null;
              }
              conectar();
            }, delay);
          }
          // CLOSED é estado normal — ignoramos
        });

      canalAtual = canal;
    };

    conectar();

    // Polling inicial (rápido) até realtime confirmar
    agendarPolling();

    // Refresh imediato quando volta do background
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        log("visibility → visible, sincronizando");
        sincronizarRef.current();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelado = true;
      if (canalAtual) supabase.removeChannel(canalAtual);
      if (timerReconexao) window.clearTimeout(timerReconexao);
      if (timerOffline) window.clearTimeout(timerOffline);
      if (timerPolling) window.clearInterval(timerPolling);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Não setamos realtimeAtivo=false aqui — evita flicker em remontagens (HMR/navegação)
    };
  }, [userId]);

  const limparDispatch = () => {
    dispatchIdAtualRef.current = null;
    setDispatchAtivo(null);
  };

  return { dispatchAtivo, realtimeAtivo, limparDispatch };
}
