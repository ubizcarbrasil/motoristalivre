import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Coordenada, StatusCorrida } from "../types/tipos_passageiro";

interface PosicaoMotorista {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

function haversineKm(a: Coordenada, b: Coordenada): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function estimarMinutos(distKm: number): number {
  // ~30 km/h em area urbana
  return Math.max(1, Math.round((distKm / 30) * 60));
}

export function useRastreamento(
  rideId: string | null,
  status: StatusCorrida | undefined,
  origemPassageiro: Coordenada | null
) {
  const [posicao, setPosicao] = useState<PosicaoMotorista | null>(null);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const [conectado, setConectado] = useState(false);
  const canalRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const desconectar = useCallback(() => {
    if (canalRef.current) {
      supabase.removeChannel(canalRef.current);
      canalRef.current = null;
    }
    setConectado(false);
    setPosicao(null);
  }, []);

  const conectar = useCallback(() => {
    if (!rideId || canalRef.current) return;

    const canal = supabase.channel(`location:${rideId}`);
    canal
      .on("broadcast", { event: "location" }, (msg) => {
        const p = msg.payload as PosicaoMotorista;
        setPosicao(p);
        if (origemPassageiro) {
          const d = haversineKm(origemPassageiro, { lat: p.lat, lng: p.lng });
          setDistanciaKm(d);
          setEtaMin(estimarMinutos(d));
        }
      })
      .subscribe((st) => {
        setConectado(st === "SUBSCRIBED");
      });

    canalRef.current = canal;
  }, [rideId, origemPassageiro]);

  // Auto-desconectar quando corrida termina
  useEffect(() => {
    if (status === "completed" || status === "cancelled" || status === "expired") {
      desconectar();
    }
  }, [status, desconectar]);

  // Cleanup
  useEffect(() => {
    return () => desconectar();
  }, [rideId, desconectar]);

  return { posicao, distanciaKm, etaMin, conectado, conectar, desconectar };
}
