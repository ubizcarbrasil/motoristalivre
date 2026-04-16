import { useEffect, useState } from "react";
import { buscarPerfilPassageiro, buscarAvaliacoesEnviadas } from "../services/servico_perfil_passageiro";
import type { AvaliacaoEnviada, DadosPerfilPassageiro } from "../types/tipos_perfil_passageiro";

export function usePerfilPassageiro(userId: string | null) {
  const [perfil, setPerfil] = useState<DadosPerfilPassageiro | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoEnviada[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    Promise.all([buscarPerfilPassageiro(userId), buscarAvaliacoesEnviadas(userId)])
      .then(([p, a]) => {
        setPerfil(p);
        setAvaliacoes(a);
      })
      .finally(() => setCarregando(false));
  }, [userId]);

  return { perfil, avaliacoes, carregando };
}
