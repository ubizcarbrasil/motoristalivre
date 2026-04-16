import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NavegacaoInferior } from "../components/navegacao_inferior";
import { AbaInicio } from "../components/aba_inicio";
import { AbaPerfil } from "../components/aba_perfil";
import { AbaTribo } from "../components/aba_tribo";
import { AbaCarteira } from "../components/aba_carteira";
import { AbaPrecos } from "../components/aba_precos";
import { TelaChat } from "@/compartilhados/components/chat/tela_chat";
import { usePainel } from "../hooks/hook_painel";

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
  } = usePainel();

  const [mostraChat, setMostraChat] = useState(false);

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!perfil || !tenant || !userId) {
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
          temCorridaAtiva={!!corridaAtiva}
          localizacaoAtiva={localizacao.ativo}
          onToggleLocalizacao={localizacao.toggle}
          onAbrirChat={() => setMostraChat(true)}
          onToggleOnline={toggleOnline}
          onAceitarDispatch={aceitarDispatch}
          onRecusarDispatch={recusarDispatch}
          onTimeoutDispatch={timeoutDispatch}
          onNavegar={setAba}
          onPrecos={() => setAba("precos")}
        />
      )}

      {aba === "perfil" && (
        <AbaPerfil perfil={perfil} onAtualizar={setPerfil} />
      )}

      {aba === "tribo" && (
        <AbaTribo
          tenantId={tenant.id}
          tenantNome={tenant.name}
          tenantSlug={tenant.slug}
          motoristaSlug={perfil.slug}
        />
      )}

      {aba === "carteira" && (
        <AbaCarteira userId={userId} />
      )}

      {aba === "precos" && (
        <AbaPrecos
          perfil={perfil}
          tenantId={tenant.id}
          onVoltar={() => setAba("inicio")}
          onAtualizar={setPerfil}
        />
      )}

      {aba !== "precos" && (
        <NavegacaoInferior abaAtiva={aba} onMudar={setAba} />
      )}

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
