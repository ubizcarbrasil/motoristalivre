import { useEffect, useMemo, useState } from "react";
import {
  listarRedePublica,
  resolverDonoRede,
} from "../services/servico_rede_publica";
import type {
  DonoRede,
  FiltroStatusRede,
  MembroRedePublica,
} from "../types/tipos_rede";

export function useHookRedePublica(
  tenantSlug: string | undefined,
  driverSlug: string | undefined,
) {
  const [dono, setDono] = useState<DonoRede | null>(null);
  const [membros, setMembros] = useState<MembroRedePublica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [status, setStatus] = useState<FiltroStatusRede>("todos");

  useEffect(() => {
    if (!tenantSlug || !driverSlug) return;
    let cancelado = false;
    (async () => {
      setCarregando(true);
      setErro(false);
      try {
        const donoResolvido = await resolverDonoRede(tenantSlug, driverSlug);
        if (cancelado) return;
        if (!donoResolvido) {
          setErro(true);
          return;
        }
        setDono(donoResolvido);
        const lista = await listarRedePublica(donoResolvido.driverId);
        if (!cancelado) setMembros(lista);
      } catch (e) {
        console.error("[useHookRedePublica]", e);
        if (!cancelado) setErro(true);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [tenantSlug, driverSlug]);

  const categoriasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    membros.forEach((m) => m.service_categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [membros]);

  const membrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return membros.filter((m) => {
      if (status !== "todos" && m.status !== status) return false;
      if (categoria && !m.service_categories.includes(categoria)) return false;
      if (termo && !m.nome.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [membros, busca, categoria, status]);

  return {
    dono,
    membros,
    membrosFiltrados,
    categoriasDisponiveis,
    carregando,
    erro,
    busca,
    setBusca,
    categoria,
    setCategoria,
    status,
    setStatus,
  };
}
