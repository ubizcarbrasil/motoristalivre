import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { NavegacaoInferior } from "../components/navegacao_inferior";
import { AbaInicio } from "../components/aba_inicio";
import { AbaPerfil } from "../components/aba_perfil";
import { AbaCarteira } from "../components/aba_carteira";
import { AbaMeusLinks } from "../components/aba_meus_links";
import { AbaConfiguracoes } from "../components/aba_configuracoes";
import { TelaAguardandoAprovacao } from "../components/tela_aguardando_aprovacao";
import { TelaChat } from "@/compartilhados/components/chat/tela_chat";
import { usePainel } from "../hooks/hook_painel";
import { useAlertaDispatch } from "../hooks/hook_alerta_dispatch";
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
  } = usePainel();

  const [mostraChat, setMostraChat] = useState(false);
  const [ehAdmin, setEhAdmin] = useState(false);

  // Calcula segundos restantes do dispatch ativo (para cadência do alerta)
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
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Perfil de motorista não encontrado</p>
          <p className="text-sm text-muted-foreground">
            Você precisa estar cadastrado como motorista em um grupo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {aba === "inicio" && (
        <AbaInicio
          perfil={perfil}
          tenantSlug={tenant.slug}
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
        />
      )}

      {aba === "meus_links" && (
        <AbaMeusLinks perfil={perfil} tenant={tenant} ehAdminGrupo={ehAdmin} />
      )}

      {aba === "carteira" && <AbaCarteira userId={userId} />}

      {aba === "perfil" && <AbaPerfil perfil={perfil} onAtualizar={setPerfil} />}

      {aba === "configuracoes" && (
        <AbaConfiguracoes
          driverId={userId}
          tenantId={tenant.id}
          ehAdmin={ehAdmin}
          tipoSom={tipoSom}
          onMudarSom={setTipoSom}
          onTestarAlerta={testarAlerta}
        />
      )}

      <NavegacaoInferior abaAtiva={aba} onMudar={setAba} />

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
    </div>
  );
}
