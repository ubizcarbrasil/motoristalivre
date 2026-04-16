import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import type { AbaPainel, PerfilMotorista, EstatisticasHoje, CorridaRecente, DispatchAtivo } from "../types/tipos_painel";
import {
  buscarPerfilMotorista,
  buscarEstatisticasHoje,
  buscarCorridasRecentes,
  buscarDispatchAtivo,
  alternarOnline,
  buscarTenantDoMotorista,
  buscarTimeoutDispatch,
  aceitarDispatch as aceitarDispatchService,
  recusarDispatch as recusarDispatchService,
  marcarDispatchTimeout as timeoutDispatchService,
} from "../services/servico_painel";
import { useDispatchRealtime } from "./hook_dispatch_realtime";
import { TIMEOUT_DISPATCH_SEG } from "../constants/constantes_painel";

export function usePainel() {
  const { usuario } = useAutenticacao();
  const [aba, setAba] = useState<AbaPainel>("inicio");
  const [perfil, setPerfil] = useState<PerfilMotorista | null>(null);
  const [stats, setStats] = useState<EstatisticasHoje>({ faturamento: 0, corridas: 0, comissoes: 0, avaliacao: 0 });
  const [corridasRecentes, setCorridasRecentes] = useState<CorridaRecente[]>([]);
  const [dispatchInicial, setDispatchInicial] = useState<DispatchAtivo | null>(null);
  const [tenant, setTenant] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [timeoutSec, setTimeoutSec] = useState<number>(TIMEOUT_DISPATCH_SEG);
  const [carregando, setCarregando] = useState(true);

  const userId = usuario?.id;

  const { dispatchAtivo, realtimeAtivo, limparDispatch } = useDispatchRealtime(userId, dispatchInicial);

  const carregar = useCallback(async () => {
    if (!userId) return;
    setCarregando(true);
    try {
      const [p, s, c, d, t] = await Promise.all([
        buscarPerfilMotorista(userId),
        buscarEstatisticasHoje(userId),
        buscarCorridasRecentes(userId),
        buscarDispatchAtivo(userId),
        buscarTenantDoMotorista(userId),
      ]);
      setPerfil(p);
      setStats(s);
      setCorridasRecentes(c);
      setDispatchInicial(d);
      setTenant(t);
      if (t?.id) {
        const sec = await buscarTimeoutDispatch(t.id);
        setTimeoutSec(sec);
      }
    } finally {
      setCarregando(false);
    }
  }, [userId]);

  useEffect(() => { carregar(); }, [carregar]);

  const toggleOnline = useCallback(async () => {
    if (!userId || !perfil) return;
    const novoStatus = !perfil.is_online;
    await alternarOnline(userId, novoStatus);
    setPerfil({ ...perfil, is_online: novoStatus });
  }, [userId, perfil]);

  const aceitarDispatch = useCallback(async () => {
    if (!dispatchAtivo) return;
    const id = dispatchAtivo.id;
    limparDispatch();
    try {
      await aceitarDispatchService(id);
      toast.success("Corrida aceita!");
      carregar();
    } catch {
      toast.error("Erro ao aceitar corrida");
    }
  }, [dispatchAtivo, limparDispatch, carregar]);

  const recusarDispatch = useCallback(async () => {
    if (!dispatchAtivo) return;
    const id = dispatchAtivo.id;
    limparDispatch();
    try {
      await recusarDispatchService(id);
    } catch {
      toast.error("Erro ao recusar corrida");
    }
  }, [dispatchAtivo, limparDispatch]);

  const timeoutDispatch = useCallback(async () => {
    if (!dispatchAtivo) return;
    const id = dispatchAtivo.id;
    limparDispatch();
    try {
      await timeoutDispatchService(id);
    } catch {
      // silencioso
    }
  }, [dispatchAtivo, limparDispatch]);

  return {
    aba,
    setAba,
    perfil,
    setPerfil,
    stats,
    corridasRecentes,
    dispatch: dispatchAtivo,
    tenant,
    timeoutSec,
    realtimeAtivo,
    carregando,
    toggleOnline,
    aceitarDispatch,
    recusarDispatch,
    timeoutDispatch,
    userId,
    recarregar: carregar,
  };
}
