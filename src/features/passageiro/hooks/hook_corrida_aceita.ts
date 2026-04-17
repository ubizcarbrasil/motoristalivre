import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CorridaAceita, StatusCorrida } from "../types/tipos_passageiro";
import { buscarMotoristaPorId, buscarAvaliacoesMotorista } from "../services/servico_corrida_aceita";

interface RideRequestRow {
  id: string;
  status: string;
  estimated_min: number | null;
  passenger_id: string | null;
  guest_passenger_id: string | null;
}

interface RideRow {
  id: string;
  ride_request_id: string;
  driver_id: string;
  passenger_id: string | null;
  guest_passenger_id: string | null;
  started_at: string | null;
  completed_at: string | null;
}

async function montarCorridaAceita(rideRequestId: string): Promise<CorridaAceita | null> {
  const { data: req } = await supabase
    .from("ride_requests")
    .select("id, status, estimated_min")
    .eq("id", rideRequestId)
    .maybeSingle();

  if (!req) return null;

  const { data: ride } = await supabase
    .from("rides")
    .select("id, driver_id, started_at, completed_at, created_at")
    .eq("ride_request_id", rideRequestId)
    .maybeSingle();

  if (!ride) return null;

  const motorista = await buscarMotoristaPorId(ride.driver_id);
  if (!motorista) return null;

  const avaliacoes = await buscarAvaliacoesMotorista(ride.driver_id, 3);

  let status: StatusCorrida = "accepted";
  if (req.status === "in_progress" || ride.started_at) status = "in_progress";
  if (req.status === "completed" || ride.completed_at) status = "completed";
  if (req.status === "cancelled") status = "cancelled";
  if (req.status === "expired") status = "expired";

  return {
    ride_request_id: req.id,
    ride_id: ride.id,
    status,
    motorista,
    estimated_min: req.estimated_min ?? 10,
    accepted_at: ride.created_at,
    avaliacoes,
  };
}

export function useCorridaAceita(
  passengerId: string | undefined,
  rideRequestId: string | null,
  guestPassengerId?: string | null
) {
  const [corrida, setCorrida] = useState<CorridaAceita | null>(null);
  const rideRequestIdRef = useRef<string | null>(rideRequestId);

  useEffect(() => {
    rideRequestIdRef.current = rideRequestId;
    if (!rideRequestId) {
      setCorrida(null);
      return;
    }
    montarCorridaAceita(rideRequestId).then((c) => {
      if (c && rideRequestIdRef.current === rideRequestId) setCorrida(c);
    });
  }, [rideRequestId]);

  useEffect(() => {
    if (!passengerId && !guestPassengerId) return;

    const idCanal = passengerId ?? guestPassengerId!;
    const filtroReq = passengerId
      ? `passenger_id=eq.${passengerId}`
      : `guest_passenger_id=eq.${guestPassengerId}`;
    const filtroRide = passengerId
      ? `passenger_id=eq.${passengerId}`
      : `guest_passenger_id=eq.${guestPassengerId}`;

    const canal = supabase
      .channel(`passenger-rides-${idCanal}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ride_requests", filter: filtroReq },
        async (payload) => {
          const row = payload.new as RideRequestRow;
          if (row.id !== rideRequestIdRef.current) return;
          if (["accepted", "in_progress", "completed", "cancelled", "expired"].includes(row.status)) {
            const c = await montarCorridaAceita(row.id);
            if (c) setCorrida(c);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rides", filter: filtroRide },
        async (payload) => {
          const row = payload.new as RideRow;
          if (row.ride_request_id !== rideRequestIdRef.current) return;
          const c = await montarCorridaAceita(row.ride_request_id);
          if (c) setCorrida(c);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rides", filter: filtroRide },
        async (payload) => {
          const row = payload.new as RideRow;
          if (row.ride_request_id !== rideRequestIdRef.current) return;
          const c = await montarCorridaAceita(row.ride_request_id);
          if (c) setCorrida(c);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [passengerId, guestPassengerId]);

  return corrida;
}
