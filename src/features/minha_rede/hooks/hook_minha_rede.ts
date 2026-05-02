import { useEffect, useState } from "react";
import {
  calcularKpis,
  listarRecrutados,
  listarRepassesMensais,
} from "../services/servico_minha_rede";
import type {
  KpisMinhaRede,
  MembroRecrutado,
  RepasseMensal,
} from "../types/tipos_minha_rede";

export function useMinhaRede(userId: string | null | undefined) {
  const [kpis, setKpis] = useState<KpisMinhaRede | null>(null);
  const [recrutados, setRecrutados] = useState<MembroRecrutado[]>([]);
  const [repasses, setRepasses] = useState<RepasseMensal[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    setCarregando(true);
    Promise.all([
      calcularKpis(userId),
      listarRecrutados(userId),
      listarRepassesMensais(userId),
    ])
      .then(([k, r, p]) => {
        if (!ativo) return;
        setKpis(k);
        setRecrutados(r);
        setRepasses(p);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [userId]);

  return { kpis, recrutados, repasses, carregando };
}
