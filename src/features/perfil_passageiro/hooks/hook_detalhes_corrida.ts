import { useEffect, useState } from "react";
import { buscarDetalhesCorrida } from "../services/servico_perfil_passageiro";
import type { DetalhesCorrida } from "../types/tipos_perfil_passageiro";

export function useDetalhesCorrida(rideId: string | null, isRideRequest: boolean) {
  const [detalhes, setDetalhes] = useState<DetalhesCorrida | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!rideId) {
      setDetalhes(null);
      return;
    }
    setCarregando(true);
    buscarDetalhesCorrida(rideId, isRideRequest)
      .then(setDetalhes)
      .finally(() => setCarregando(false));
  }, [rideId, isRideRequest]);

  return { detalhes, carregando };
}
