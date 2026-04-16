import { useEffect, useState } from "react";
import { buscarValidacaoCorridaFetch } from "../services/servico_validacao_corrida";
import type { RespostaValidacao } from "../types/tipos_validacao_corrida";

interface EstadoValidacao {
  carregando: boolean;
  resposta: RespostaValidacao | null;
  erro: string | null;
}

export function useValidacaoCorrida(rideId: string | undefined): EstadoValidacao {
  const [estado, setEstado] = useState<EstadoValidacao>({
    carregando: true,
    resposta: null,
    erro: null,
  });

  useEffect(() => {
    if (!rideId) {
      setEstado({ carregando: false, resposta: null, erro: "ID inválido" });
      return;
    }

    let ativo = true;
    setEstado({ carregando: true, resposta: null, erro: null });

    buscarValidacaoCorridaFetch(rideId)
      .then((resposta) => {
        if (ativo) setEstado({ carregando: false, resposta, erro: null });
      })
      .catch((err: Error) => {
        if (ativo)
          setEstado({
            carregando: false,
            resposta: null,
            erro: err.message ?? "Erro desconhecido",
          });
      });

    return () => {
      ativo = false;
    };
  }, [rideId]);

  return estado;
}
