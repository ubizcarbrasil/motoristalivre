import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { NavegacaoInferior } from "../components/navegacao_inferior";
import { AbaInicio } from "../components/aba_inicio";
import { BannerOnboardingProfissional } from "../components/banner_onboarding_profissional";
import { DialogoOnboardingProfissional } from "../components/dialogo_onboarding_profissional";
import { useHookOnboardingProfissional } from "../hooks/hook_onboarding_profissional";
import { AbaPerfil } from "../components/aba_perfil";
import { AbaCarteira } from "../components/aba_carteira";
import { AbaMeusLinks } from "../components/aba_meus_links";
import { AbaConfiguracoes } from "../components/aba_configuracoes";
import { AbaTribo } from "../components/aba_tribo";
import { TelaAguardandoAprovacao } from "../components/tela_aguardando_aprovacao";
import { TelaChat } from "@/compartilhados/components/chat/tela_chat";
import { usePainel } from "../hooks/hook_painel";
import { useAlertaDispatch } from "../hooks/hook_alerta_dispatch";
import { usePublicarPresencaMotorista } from "../hooks/hook_publicar_presenca";
import { useTribosMotorista } from "../hooks/hook_tribos_motorista";
import { abaPermitida } from "../utils/abas_por_modulo";
import { resolverModoPainel } from "../utils/modo_painel";
import { supabase } from "@/integrations/supabase/client";

export default function PaginaPainel() {
  const {
    aba,
    setAba,
    perfil,
    setPerfil,
    stats,
    corridasRecentes,
    dispatch,
    tenant,
    timeoutSec,
    realtimeAtivo,
    carregando,
    toggleOnline,
    aceitarDispatch,
    recusarDispatch,
    timeoutDispatch,
    userId,
    corridaAtiva,
    localizacao,
    solicitacaoPendente,
    recarregar,
  } = usePainel();

  const [mostraChat, setMostraChat] = useState(false);
  const [ehAdmin, setEhAdmin] = useState(false);
  const [triboAtivaId, setTriboAtivaId] = useState<string | null>(null);
  const [dialogoOnboardingAberto, setDialogoOnboardingAberto] = useState(false);
  const [onboardingJaAbriu, setOnboardingJaAbriu] = useState(false);

  const { tribos } = useTribosMotorista(userId);

  // Define tribo ativa: principal por padrão, ou primeira da lista
  useEffect(() => {
    if (!triboAtivaId && tribos.length > 0) {
      const principal = tribos.find((t) => t.ehPrincipal) ?? tribos[0];
      setTriboAtivaId(principal.id);
    }
  }, [tribos, triboAtivaId]);

  const triboAtiva = useMemo(
    () => tribos.find((t) => t.id === triboAtivaId) ?? null,
    [tribos, triboAtivaId],
  );

  const ehDonoDeAlguma = tribos.some((t) => t.papel === "dono");
  const mostrarAbaTribo = ehDonoDeAlguma || tribos.length > 0;
  const semPerfilMotorista = !perfil || !tenant;
  const podeAcessarComoDono = semPerfilMotorista && ehDonoDeAlguma && !!triboAtiva;

  // Módulos da tribo ativa (fonte da verdade da UI)
  const activeModulesAtual =
    triboAtiva?.activeModules ?? tenant?.active_modules ?? ["mobility"];

  // Modo visual resolvido considerando tipo profissional do usuário
  const modoPainel = resolverModoPainel(
    perfil?.professional_type,
    activeModulesAtual,
  );

  // Se a aba atual não é permitida pelos módulos ativos, volta para Início
  useEffect(() => {
    if (!abaPermitida(aba, activeModulesAtual)) {
      setAba("inicio");
    }
  }, [aba, activeModulesAtual, setAba]);

  // Se não é motorista mas é dono de tribo, força aba "tribo"
  useEffect(() => {
    if (podeAcessarComoDono && aba !== "tribo" && aba !== "carteira" && aba !== "perfil" && aba !== "configuracoes") {
      setAba("tribo");
    }
  }, [podeAcessarComoDono, aba, setAba]);

  const segundosRestantes = useMemo(() => {
    if (!dispatch) return undefined;
    const elapsed = Math.floor((Date.now() - new Date(dispatch.dispatched_at).getTime()) / 1000);
    return Math.max(0, timeoutSec - elapsed);
  }, [dispatch, timeoutSec]);

  const { silenciado, alternarSilenciado, tipoSom, setTipoSom, audioDestravado, testarAlerta } = useAlertaDispatch({
    ativo: !!dispatch,
    segundosRestantes,
    driverId: userId ?? undefined,
  });

  usePublicarPresencaMotorista(userId ?? undefined);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const role = data?.role;
        setEhAdmin(role === "tenant_admin" || role === "manager" || role === "root_admin");
      });
  }, [userId]);

  // Onboarding profissional: detecta campos faltantes e abre auto após criação da tribo
  const onboardingDriverId = userId ?? "";
  const onboardingTenantId = tenant?.id ?? "";
  const {
    dados: dadosOnboarding,
    camposFaltantes,
    precisaOnboarding,
    recarregar: recarregarOnboarding,
  } = useHookOnboardingProfissional(onboardingDriverId, onboardingTenantId);

  useEffect(() => {
    if (!userId || !tenant?.id) return;
    if (precisaOnboarding && !onboardingJaAbriu && !dialogoOnboardingAberto) {
      setDialogoOnboardingAberto(true);
      setOnboardingJaAbriu(true);
    }
  }, [userId, tenant?.id, precisaOnboarding, onboardingJaAbriu, dialogoOnboardingAberto]);

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!perfil || !tenant || !userId) {
    if (solicitacaoPendente) {
      return <TelaAguardandoAprovacao nomeGrupo={solicitacaoPendente.tenantNome} />;
    }

    // Dono de tribo sem perfil de motorista: renderiza apenas o painel da tribo
    if (podeAcessarComoDono && userId && triboAtiva) {
      return (
        <div className="min-h-screen bg-background text-foreground pb-20">
          {(aba === "tribo" || aba === "inicio") && (
            <AbaTribo
              tribo={triboAtiva}
              semPerfilDriver={!perfil}
              onAtivarMotorista={recarregar}
              professionalType={perfil?.professional_type ?? null}
            />
          )}
          {aba === "carteira" && <AbaCarteira userId={userId} />}
          {aba === "configuracoes" && (
            <AbaConfiguracoes
              driverId={userId}
              tenantId={triboAtiva.id}
              ehAdmin={true}
              activeModules={activeModulesAtual}
              modo={modoPainel}
              tipoSom={tipoSom}
              onMudarSom={setTipoSom}
              onTestarAlerta={testarAlerta}
            />
          )}
          <NavegacaoInferior
            abaAtiva={aba === "inicio" ? "tribo" : aba}
            onMudar={setAba}
            mostrarTribo={true}
            modoSomenteDono
            activeModules={activeModulesAtual}
            modo={modoPainel}
          />
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Perfil profissional não encontrado</p>
          <p className="text-sm text-muted-foreground">
            Você precisa estar cadastrado como profissional em um grupo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {aba === "inicio" && (
        <>
          {precisaOnboarding && (
            <div className="px-4 pt-4">
              <BannerOnboardingProfissional
                camposFaltantes={camposFaltantes}
                onAbrir={() => setDialogoOnboardingAberto(true)}
              />
            </div>
          )}
          <AbaInicio
            perfil={perfil}
            tenantSlug={triboAtiva?.slug ?? tenant.slug}
            activeModules={activeModulesAtual}
            stats={stats}
            corridas={corridasRecentes}
            dispatch={dispatch}
            timeoutSec={timeoutSec}
            realtimeAtivo={realtimeAtivo}
            audioDestravado={audioDestravado}
            temCorridaAtiva={!!corridaAtiva}
            localizacaoAtiva={localizacao.ativo}
            silenciado={silenciado}
            onAlternarSom={alternarSilenciado}
            onToggleLocalizacao={localizacao.toggle}
            onAbrirChat={() => setMostraChat(true)}
            onToggleOnline={toggleOnline}
            onAceitarDispatch={aceitarDispatch}
            onRecusarDispatch={recusarDispatch}
            onTimeoutDispatch={timeoutDispatch}
            onNavegar={setAba}
            tribos={tribos}
            triboAtivaId={triboAtivaId}
            onSelecionarTribo={setTriboAtivaId}
          />
        </>
      )}

      {aba === "tribo" && triboAtiva && (
        <AbaTribo
          tribo={triboAtiva}
          semPerfilDriver={!perfil}
          onAtivarMotorista={recarregar}
          professionalType={perfil?.professional_type ?? null}
        />
      )}

      {aba === "meus_links" && abaPermitida("meus_links", activeModulesAtual) && (
        <AbaMeusLinks perfil={perfil} tenant={tenant} ehAdminGrupo={ehAdmin} />
      )}

      {aba === "carteira" && <AbaCarteira userId={userId} />}

      {aba === "perfil" && <AbaPerfil perfil={perfil} onAtualizar={setPerfil} />}

      {aba === "configuracoes" && (
        <AbaConfiguracoes
          driverId={userId}
          tenantId={tenant.id}
          ehAdmin={ehAdmin}
          activeModules={activeModulesAtual}
          modo={modoPainel}
          tipoSom={tipoSom}
          onMudarSom={setTipoSom}
          onTestarAlerta={testarAlerta}
        />
      )}

      <NavegacaoInferior
        abaAtiva={aba}
        onMudar={setAba}
        mostrarTribo={mostrarAbaTribo}
        activeModules={activeModulesAtual}
        modo={modoPainel}
      />

      {mostraChat && corridaAtiva && (
        <TelaChat
          rideId={corridaAtiva.ride_id}
          meuId={userId}
          meuPapel="driver"
          outroNome={corridaAtiva.passenger_nome}
          outroAvatar={corridaAtiva.passenger_avatar}
          outroSubtitulo="Passageiro"
          outroTelefone={corridaAtiva.passenger_telefone}
          onVoltar={() => setMostraChat(false)}
        />
      )}

      <DialogoOnboardingProfissional
        aberto={dialogoOnboardingAberto}
        driverId={userId}
        tenantId={tenant.id}
        dadosIniciais={dadosOnboarding}
        onConcluido={() => {
          setDialogoOnboardingAberto(false);
          recarregarOnboarding();
        }}
        onFechar={() => setDialogoOnboardingAberto(false)}
      />
    </div>
  );
}
