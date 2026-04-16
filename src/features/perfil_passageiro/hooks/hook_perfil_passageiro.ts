import { useEffect, useState } from "react";
import {
  buscarPerfilPassageiro,
  buscarAvaliacoesEnviadas,
  buscarHistoricoCorridas,
} from "../services/servico_perfil_passageiro";
import type {
  AvaliacaoEnviada,
  CorridaHistorico,
  DadosPerfilPassageiro,
} from "../types/tipos_perfil_passageiro";

export function usePerfilPassageiro(userId: string | null) {
  const [perfil, setPerfil] = useState<DadosPerfilPassageiro | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoEnviada[]>([]);
  const [corridas, setCorridas] = useState<CorridaHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    Promise.all([
      buscarPerfilPassageiro(userId),
      buscarAvaliacoesEnviadas(userId),
      buscarHistoricoCorridas(userId),
    ])
      .then(([p, a, c]) => {
        setPerfil(p);
        setAvaliacoes(a);
        setCorridas(c);
      })
      .finally(() => setCarregando(false));
  }, [userId]);

  return { perfil, avaliacoes, corridas, carregando };
}
