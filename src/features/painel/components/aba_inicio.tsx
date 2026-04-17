import { HeaderPainel } from "../components/header_painel";
import { CardDispatch } from "../components/card_dispatch";
import { GridStats } from "../components/grid_stats";
import { ListaCorridas } from "../components/lista_corridas";
import { AcessoRapido } from "../components/acesso_rapido";
import { ToggleLocalizacao } from "../components/toggle_localizacao";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import type { PerfilMotorista, EstatisticasHoje, CorridaRecente, DispatchAtivo, AbaPainel } from "../types/tipos_painel";

interface AbaInicioProps {
  perfil: PerfilMotorista;
  tenantSlug: string;
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
}

export function AbaInicio({
  perfil,
  tenantSlug,
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
}: AbaInicioProps) {
  return (
    <div className="pb-20 space-y-4">
      <HeaderPainel
        perfil={perfil}
        tenantSlug={tenantSlug}
        realtimeAtivo={realtimeAtivo}
        audioDestravado={audioDestravado}
        onToggleOnline={onToggleOnline}
      />

      {temCorridaAtiva && (
        <div className="px-4 flex items-center gap-2">
          <ToggleLocalizacao ativo={localizacaoAtiva} onToggle={onToggleLocalizacao} />
          <Button variant="outline" size="sm" className="gap-2" onClick={onAbrirChat}>
            <MessageCircle className="w-4 h-4" />
            Chat
          </Button>
        </div>
      )}

      {dispatch && (
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

      <GridStats stats={stats} />
      <AcessoRapido onNavegar={onNavegar} tenantSlug={tenantSlug} />
      <ListaCorridas corridas={corridas} />
    </div>
  );
}
