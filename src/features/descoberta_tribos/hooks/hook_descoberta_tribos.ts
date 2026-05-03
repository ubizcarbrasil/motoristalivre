import { useEffect, useState } from "react";
import {
  listarCategoriasComTribos,
  listarCidadesComTribos,
  listarTribosPublicas,
} from "../services/servico_descoberta_tribos";
import type {
  CategoriaFiltro,
  FiltrosDescobertaTribos,
  TriboPublicaListada,
} from "../types/tipos_descoberta_tribos";

export function useDescobertaTribos(filtrosIniciais: FiltrosDescobertaTribos = {}) {
  const [filtros, setFiltros] = useState<FiltrosDescobertaTribos>(filtrosIniciais);
  const [tribos, setTribos] = useState<TriboPublicaListada[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFiltro[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([listarCategoriasComTribos(), listarCidadesComTribos()]).then(
      ([cats, cits]) => {
        setCategorias(cats);
        setCidades(cits);
      },
    );
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    const t = setTimeout(() => {
      listarTribosPublicas(filtros).then((dados) => {
        if (!cancelado) {
          setTribos(dados);
          setCarregando(false);
        }
      });
    }, filtros.busca ? 300 : 0);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [filtros.busca, filtros.categoriaSlug, filtros.cidade, filtros.limite]);

  return { filtros, setFiltros, tribos, categorias, cidades, carregando };
}
