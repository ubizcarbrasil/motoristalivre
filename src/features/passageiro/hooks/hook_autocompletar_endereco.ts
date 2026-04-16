import { useState, useEffect, useRef, useCallback } from "react";
import { buscarEnderecosNominatim } from "../services/servico_passageiro";

interface ResultadoBusca {
  endereco: string;
  lat: number;
  lng: number;
}

export function useAutocompletarEndereco() {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [carregando, setCarregando] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (consulta.length < 3) {
      setResultados([]);
      return;
    }

    setCarregando(true);
    timeoutRef.current = setTimeout(async () => {
      const r = await buscarEnderecosNominatim(consulta);
      setResultados(r);
      setCarregando(false);
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [consulta]);

  const limpar = useCallback(() => {
    setConsulta("");
    setResultados([]);
  }, []);

  return { consulta, setConsulta, resultados, carregando, limpar };
}
