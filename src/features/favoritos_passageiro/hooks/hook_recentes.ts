import { useCallback, useEffect, useState } from "react";
import { listarDestinosRecentes } from "../services/servico_recentes";
import type { EnderecoRecente } from "../types/tipos_recentes";

interface UseRecentesParams {
  passengerId: string | null;
}

export function useDestinosRecentes({ passengerId }: UseRecentesParams) {
  const [recentes, setRecentes] = useState<EnderecoRecente[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    if (!passengerId) {
      setRecentes([]);
      return;
    }
    setCarregando(true);
    try {
      const lista = await listarDestinosRecentes(passengerId);
      setRecentes(lista);
    } finally {
      setCarregando(false);
    }
  }, [passengerId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { recentes, carregando, recarregar: carregar };
}
