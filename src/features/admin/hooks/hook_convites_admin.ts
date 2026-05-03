import { useCallback, useEffect, useState } from "react";
import {
  buscarProfissionaisPorTermo,
  convidarProfissional,
  cancelarConvite,
  listarConvitesEnviados,
  listarSolicitacoesRecebidas,
  responderSolicitacao,
} from "../services/servico_convites_admin";
import type {
  ConviteEnviado,
  ProfissionalBusca,
  SolicitacaoRecebida,
  StatusConviteAdmin,
} from "../types/tipos_convites";

export function useConvitesAdmin(tenantId: string) {
  const [resultadosBusca, setResultadosBusca] = useState<ProfissionalBusca[]>([]);
  const [carregandoBusca, setCarregandoBusca] = useState(false);

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRecebida[]>([]);
  const [convites, setConvites] = useState<ConviteEnviado[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<StatusConviteAdmin | "todos">("pending");
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!tenantId) return;
    setCarregando(true);
    try {
      const status = filtroStatus === "todos" ? undefined : filtroStatus;
      const [s, c] = await Promise.all([
        listarSolicitacoesRecebidas(tenantId),
        listarConvitesEnviados(tenantId, status),
      ]);
      setSolicitacoes(s);
      setConvites(c);
    } finally {
      setCarregando(false);
    }
  }, [tenantId, filtroStatus]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const buscar = useCallback(
    async (termo: string) => {
      if (!tenantId) return;
      setCarregandoBusca(true);
      try {
        const r = await buscarProfissionaisPorTermo(tenantId, termo);
        setResultadosBusca(r);
      } finally {
        setCarregandoBusca(false);
      }
    },
    [tenantId],
  );

  const convidar = useCallback(
    async (driverId: string, mensagem?: string) => {
      await convidarProfissional(tenantId, driverId, mensagem);
      await recarregar();
      setResultadosBusca((prev) =>
        prev.map((p) =>
          p.driver_id === driverId ? { ...p, ja_tem_convite_pendente: true } : p,
        ),
      );
    },
    [tenantId, recarregar],
  );

  const cancelar = useCallback(
    async (conviteId: string) => {
      await cancelarConvite(conviteId);
      await recarregar();
    },
    [recarregar],
  );

  const responder = useCallback(
    async (conviteId: string, resposta: "accepted" | "rejected") => {
      await responderSolicitacao(conviteId, resposta);
      await recarregar();
    },
    [recarregar],
  );

  return {
    resultadosBusca,
    carregandoBusca,
    buscar,
    convidar,
    solicitacoes,
    convites,
    filtroStatus,
    setFiltroStatus,
    carregando,
    cancelar,
    responder,
    recarregar,
  };
}
