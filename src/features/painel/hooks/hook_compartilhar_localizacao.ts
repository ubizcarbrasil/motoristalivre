import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const INTERVALO_MS = 5000;

export function useCompartilharLocalizacao(rideId: string | null) {
  const [ativo, setAtivo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canalRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const enviarPosicao = useCallback(() => {
    if (!rideId || !canalRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        canalRef.current?.send({
          type: "broadcast",
          event: "location",
          payload: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: Date.now(),
          },
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 2000 }
    );
  }, [rideId]);

  const iniciar = useCallback(() => {
    if (!rideId || !navigator.geolocation) return;
    const canal = supabase.channel(`location:${rideId}`);
    canal.subscribe();
    canalRef.current = canal;
    enviarPosicao();
    intervalRef.current = setInterval(enviarPosicao, INTERVALO_MS);
    setAtivo(true);
  }, [rideId, enviarPosicao]);

  const parar = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (canalRef.current) {
      supabase.removeChannel(canalRef.current);
      canalRef.current = null;
    }
    setAtivo(false);
  }, []);

  const toggle = useCallback(() => {
    if (ativo) parar();
    else iniciar();
  }, [ativo, iniciar, parar]);

  // Cleanup on unmount or rideId change
  useEffect(() => {
    return () => parar();
  }, [rideId, parar]);

  return { ativo, toggle };
}
