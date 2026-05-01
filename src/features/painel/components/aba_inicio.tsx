import { HeaderPainel } from "../components/header_painel";
import { CardDispatch } from "../components/card_dispatch";
import { GridStats } from "../components/grid_stats";
import { ListaCorridas } from "../components/lista_corridas";
import { AcessoRapido } from "../components/acesso_rapido";
import { ToggleLocalizacao } from "../components/toggle_localizacao";
import { SecaoAgendaHoje } from "./secao_agenda_hoje";
import { useHookPerfilServico } from "@/features/servicos/hooks/hook_perfil_servico";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import type { PerfilMotorista, EstatisticasHoje, CorridaRecente, DispatchAtivo, AbaPainel } from "../types/tipos_painel";
import type { TriboMotorista } from "../types/tipos_tribos";

interface AbaInicioProps {
  perfil: PerfilMotorista;
  tenantSlug: string;
  activeModules: string[];
  stats: EstatisticasHoje;
  corridas: CorridaRecente[];
  dispatch: DispatchAtivo | null;
  timeoutSec: number;
  realtimeAtivo: boolean;
  audioDestravado?: boolean;
  temCorridaAtiva: boolean;
  localizacaoAtiva: boolean;
  silenciado?: boolean;
  onAlternarSom?: () => void;
  onToggleLocalizacao: () => void;
  onAbrirChat: () => void;
  onToggleOnline: () => void;
  onAceitarDispatch: () => void | Promise<void>;
  onRecusarDispatch: () => void | Promise<void>;
  onTimeoutDispatch: () => void | Promise<void>;
  onNavegar: (aba: AbaPainel) => void;
  tribos?: TriboMotorista[];
  triboAtivaId?: string | null;
  onSelecionarTribo?: (id: string) => void;
}

export function AbaInicio({
  perfil,
  tenantSlug,
  activeModules,
  stats,
  corridas,
  dispatch,
  timeoutSec,
  realtimeAtivo,
  audioDestravado,
  temCorridaAtiva,
  localizacaoAtiva,
  silenciado,
  onAlternarSom,
  onToggleLocalizacao,
  onAbrirChat,
  onToggleOnline,
  onAceitarDispatch,
  onRecusarDispatch,
  onTimeoutDispatch,
  onNavegar,
  tribos,
  triboAtivaId,
  onSelecionarTribo,
}: AbaInicioProps) {
  const servico = useHookPerfilServico(perfil.id);
  const temMobilidade = activeModules.includes("mobility");
  const temServicos = activeModules.includes("services");
  const ehProfissional =
    temServicos &&
    (servico.professionalType === "service_provider" || servico.professionalType === "both");

  return (
    <div className="pb-20 space-y-4">
      <HeaderPainel
        perfil={perfil}
        tenantSlug={tenantSlug}
        mostrarToggleOnline={temMobilidade}
        realtimeAtivo={realtimeAtivo}
        audioDestravado={audioDestravado}
        onToggleOnline={onToggleOnline}
        tribos={tribos}
        triboAtivaId={triboAtivaId}
        onSelecionarTribo={onSelecionarTribo}
      />

      {temMobilidade && temCorridaAtiva && (
        <div className="px-4 flex items-center gap-2">
          <ToggleLocalizacao ativo={localizacaoAtiva} onToggle={onToggleLocalizacao} />
          <Button variant="outline" size="sm" className="gap-2" onClick={onAbrirChat}>
            <MessageCircle className="w-4 h-4" />
            Chat
          </Button>
        </div>
      )}

      {ehProfissional && <SecaoAgendaHoje agendamentos={servico.agendaHoje} />}

      {temMobilidade && dispatch && (
        <CardDispatch
          dispatch={dispatch}
          timeoutSec={timeoutSec}
          silenciado={silenciado}
          onAlternarSom={onAlternarSom}
          onAceitar={onAceitarDispatch}
          onRecusar={onRecusarDispatch}
          onTimeout={onTimeoutDispatch}
        />
      )}

      {temMobilidade && <GridStats stats={stats} />}
      <AcessoRapido onNavegar={onNavegar} tenantSlug={tenantSlug} />
      {temMobilidade && <ListaCorridas corridas={corridas} />}
    </div>
  );
}
