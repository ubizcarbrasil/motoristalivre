import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
  buscarCorridaAtiva,
  aceitarDispatch as aceitarDispatchService,
  recusarDispatch as recusarDispatchService,
  marcarDispatchTimeout as timeoutDispatchService,
} from "../services/servico_painel";
import { useDispatchRealtime } from "./hook_dispatch_realtime";
import { useCompartilharLocalizacao } from "./hook_compartilhar_localizacao";
import { TIMEOUT_DISPATCH_SEG } from "../constants/constantes_painel";

const ABAS_VALIDAS: AbaPainel[] = ["inicio", "tribo", "meus_links", "carteira", "perfil", "configuracoes"];

export function usePainel() {
  const { usuario } = useAutenticacao();
  const [searchParams] = useSearchParams();
  const abaInicial = (() => {
    const q = searchParams.get("aba");
    return q && (ABAS_VALIDAS as string[]).includes(q) ? (q as AbaPainel) : "inicio";
  })();
  const [aba, setAba] = useState<AbaPainel>(abaInicial);
  const [perfil, setPerfil] = useState<PerfilMotorista | null>(null);
  const [stats, setStats] = useState<EstatisticasHoje>({ faturamento: 0, corridas: 0, comissoes: 0, avaliacao: 0 });
  const [corridasRecentes, setCorridasRecentes] = useState<CorridaRecente[]>([]);
  const [dispatchInicial, setDispatchInicial] = useState<DispatchAtivo | null>(null);
  const [tenant, setTenant] = useState<{ id: string; name: string; slug: string; active_modules: string[] } | null>(null);
  const [timeoutSec, setTimeoutSec] = useState<number>(TIMEOUT_DISPATCH_SEG);
  const [carregando, setCarregando] = useState(true);
  const [corridaAtiva, setCorridaAtiva] = useState<Awaited<ReturnType<typeof buscarCorridaAtiva>>>(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState<{ tenantNome: string } | null>(null);

  const userId = usuario?.id;

  const { dispatchAtivo, realtimeAtivo, limparDispatch } = useDispatchRealtime(userId, dispatchInicial);
  const localizacao = useCompartilharLocalizacao(corridaAtiva?.ride_id ?? null);

  const carregar = useCallback(async () => {
    if (!userId) return;
    setCarregando(true);
    try {
      // Processa intenção pendente de virar motorista (vinda do /cadastro?tipo=motorista)
      const slugPendente = localStorage.getItem("tribocar_pending_driver_join");
      if (slugPendente) {
        try {
          await (await import("@/integrations/supabase/client")).supabase.rpc("request_driver_join", {
            _tenant_slug: slugPendente,
            _message: null,
          });
        } catch {
          // silencioso — pode já existir ou ser inválido
        }
        localStorage.removeItem("tribocar_pending_driver_join");
      }

      // Processa intenção pendente de profissional autônomo (vinda do /cadastro?tipo=profissional)
      const profissionalPendente = localStorage.getItem("tribocar_pending_professional_setup");
      if (profissionalPendente) {
        try {
          const { criarTriboProfissional } = await import(
            "@/features/autenticacao/services/servico_criar_tribo_profissional"
          );
          const nomePref =
            profissionalPendente !== "1"
              ? profissionalPendente
              : usuario?.user_metadata?.full_name || usuario?.user_metadata?.name || usuario?.email || "Profissional";
          await criarTriboProfissional(nomePref);
        } catch {
          // silencioso — banner de onboarding cobre o caso
        }
        localStorage.removeItem("tribocar_pending_professional_setup");
      }

      // Processa intenção pendente de entrar em tribo via signup_slug
      const triboPendente = localStorage.getItem("tribocar_pending_tribo_signup");
      if (triboPendente) {
        try {
          const { entrarNaTriboPorSignupSlug } = await import(
            "@/features/cadastro_por_categoria/services/servico_tribo_signup"
          );
          await entrarNaTriboPorSignupSlug(triboPendente);
        } catch {
          // silencioso — slug pode ter sido removido ou inválido
        }
        localStorage.removeItem("tribocar_pending_tribo_signup");
      }

      const [p, s, c, d, t, ride] = await Promise.all([
        buscarPerfilMotorista(userId),
        buscarEstatisticasHoje(userId),
        buscarCorridasRecentes(userId),
        buscarDispatchAtivo(userId),
        buscarTenantDoMotorista(userId),
        buscarCorridaAtiva(userId),
      ]);
      setPerfil(p);
      setStats(s);
      setCorridasRecentes(c);
      setDispatchInicial(d);
      setTenant(t);
      setCorridaAtiva(ride);
      if (t?.id) {
        const sec = await buscarTimeoutDispatch(t.id);
        setTimeoutSec(sec);
      }

      // Se não tem perfil de motorista, verifica se há solicitação pendente
      if (!p) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: convites } = await supabase
          .from("driver_group_invites")
          .select("tenant_id, tenants:tenant_id(name)")
          .eq("driver_id", userId)
          .eq("direction", "request_from_driver")
          .eq("status", "pending")
          .limit(1);
        const convite = convites?.[0] as { tenants?: { name?: string } } | undefined;
        if (convite) {
          setSolicitacaoPendente({ tenantNome: convite.tenants?.name ?? "grupo" });
        } else {
          setSolicitacaoPendente(null);
        }
      } else {
        setSolicitacaoPendente(null);
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
    corridaAtiva,
    localizacao,
    solicitacaoPendente,
  };
}
