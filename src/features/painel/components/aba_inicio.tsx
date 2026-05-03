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
import { resolverModoPainel, mostraMobilidade, mostraServicos } from "../utils/modo_painel";

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
  const modo = resolverModoPainel(perfil.professional_type, activeModules);
  const exibirMobilidade = mostraMobilidade(modo);
  const exibirServicos = mostraServicos(modo);

  return (
    <div className="pb-20 space-y-4">
      <HeaderPainel
        perfil={perfil}
        tenantSlug={tenantSlug}
        mostrarToggleOnline={exibirMobilidade}
        modo={modo}
        realtimeAtivo={realtimeAtivo}
        audioDestravado={audioDestravado}
        onToggleOnline={onToggleOnline}
        tribos={tribos}
        triboAtivaId={triboAtivaId}
        onSelecionarTribo={onSelecionarTribo}
      />

      {exibirMobilidade && temCorridaAtiva && (
        <div className="px-4 flex items-center gap-2">
          <ToggleLocalizacao ativo={localizacaoAtiva} onToggle={onToggleLocalizacao} />
          <Button variant="outline" size="sm" className="gap-2" onClick={onAbrirChat}>
            <MessageCircle className="w-4 h-4" />
            Chat
          </Button>
        </div>
      )}

      {exibirServicos && (
        <SecaoAgendaHoje agendamentos={servico.agendaHoje} driverId={perfil.id} />
      )}

      {exibirMobilidade && dispatch && (
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

      <GridStats
        stats={stats}
        modo={modo}
        agendamentosHoje={servico.agendaHoje.length}
        servicosAtivos={servico.servicos.filter((s) => s.is_active).length}
      />
      <AcessoRapido onNavegar={onNavegar} tenantSlug={tenantSlug} modo={modo} driverSlug={perfil.slug} />
      {exibirMobilidade && <ListaCorridas corridas={corridas} />}
    </div>
  );
}
