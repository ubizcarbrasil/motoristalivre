import { useState, useEffect, useCallback } from "react";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import type { AbaPainel, PerfilMotorista, EstatisticasHoje, CorridaRecente, DispatchAtivo } from "../types/tipos_painel";
import {
  buscarPerfilMotorista,
  buscarEstatisticasHoje,
  buscarCorridasRecentes,
  buscarDispatchAtivo,
  alternarOnline,
  buscarTenantDoMotorista,
} from "../services/servico_painel";

export function usePainel() {
  const { usuario } = useAutenticacao();
  const [aba, setAba] = useState<AbaPainel>("inicio");
  const [perfil, setPerfil] = useState<PerfilMotorista | null>(null);
  const [stats, setStats] = useState<EstatisticasHoje>({ faturamento: 0, corridas: 0, comissoes: 0, avaliacao: 0 });
  const [corridasRecentes, setCorridasRecentes] = useState<CorridaRecente[]>([]);
  const [dispatch, setDispatch] = useState<DispatchAtivo | null>(null);
  const [tenant, setTenant] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [carregando, setCarregando] = useState(true);

  const userId = usuario?.id;

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
      setDispatch(d);
      setTenant(t);
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

  return {
    aba,
    setAba,
    perfil,
    setPerfil,
    stats,
    corridasRecentes,
    dispatch,
    tenant,
    carregando,
    toggleOnline,
    userId,
    recarregar: carregar,
  };
}
