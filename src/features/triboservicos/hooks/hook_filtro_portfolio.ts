import { useMemo, useState } from "react";
import type { ItemPortfolio } from "../services/servico_vitrine_publica";

const ITENS_POR_PAGINA = 9;

interface RetornoFiltroPortfolio {
  itensPagina: ItemPortfolio[];
  totalFiltrado: number;
  servicoSelecionado: string;
  setServicoSelecionado: (id: string) => void;
  busca: string;
  setBusca: (texto: string) => void;
  paginaAtual: number;
  setPaginaAtual: (pagina: number) => void;
  totalPaginas: number;
}

/**
 * Aplica filtros (serviço + busca) e paginação local sobre o portfólio.
 */
export function useFiltroPortfolio(itens: ItemPortfolio[]): RetornoFiltroPortfolio {
  const [servicoSelecionado, setServicoSelecionadoState] = useState("todos");
  const [busca, setBuscaState] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const filtrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();
    return itens.filter((item) => {
      const passaServico =
        servicoSelecionado === "todos" || item.service_type_id === servicoSelecionado;
      const passaBusca =
        !buscaNormalizada ||
        (item.caption ?? "").toLowerCase().includes(buscaNormalizada);
      return passaServico && passaBusca;
    });
  }, [itens, servicoSelecionado, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const itensPagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  function setServicoSelecionado(id: string) {
    setServicoSelecionadoState(id);
    setPaginaAtual(1);
  }

  function setBusca(texto: string) {
    setBuscaState(texto);
    setPaginaAtual(1);
  }

  return {
    itensPagina,
    totalFiltrado: filtrados.length,
    servicoSelecionado,
    setServicoSelecionado,
    busca,
    setBusca,
    paginaAtual: paginaSegura,
    setPaginaAtual,
    totalPaginas,
  };
}
