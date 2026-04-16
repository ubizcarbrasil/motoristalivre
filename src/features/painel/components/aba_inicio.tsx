import { HeaderPainel } from "../components/header_painel";
import { CardDispatch } from "../components/card_dispatch";
import { GridStats } from "../components/grid_stats";
import { ListaCorridas } from "../components/lista_corridas";
import { AcessoRapido } from "../components/acesso_rapido";
import type { PerfilMotorista, EstatisticasHoje, CorridaRecente, DispatchAtivo, AbaPainel } from "../types/tipos_painel";

interface AbaInicioProps {
  perfil: PerfilMotorista;
  tenantSlug: string;
  stats: EstatisticasHoje;
  corridas: CorridaRecente[];
  dispatch: DispatchAtivo | null;
  timeoutSec: number;
  realtimeAtivo: boolean;
  onToggleOnline: () => void;
  onAceitarDispatch: () => void | Promise<void>;
  onRecusarDispatch: () => void | Promise<void>;
  onTimeoutDispatch: () => void | Promise<void>;
  onNavegar: (aba: AbaPainel) => void;
  onPrecos: () => void;
}

export function AbaInicio({
  perfil,
  tenantSlug,
  stats,
  corridas,
  dispatch,
  timeoutSec,
  realtimeAtivo,
  onToggleOnline,
  onAceitarDispatch,
  onRecusarDispatch,
  onTimeoutDispatch,
  onNavegar,
  onPrecos,
}: AbaInicioProps) {
  return (
    <div className="pb-20 space-y-4">
      <HeaderPainel
        perfil={perfil}
        tenantSlug={tenantSlug}
        realtimeAtivo={realtimeAtivo}
        onToggleOnline={onToggleOnline}
      />

      {dispatch && (
        <CardDispatch
          dispatch={dispatch}
          timeoutSec={timeoutSec}
          onAceitar={onAceitarDispatch}
          onRecusar={onRecusarDispatch}
          onTimeout={onTimeoutDispatch}
        />
      )}

      <GridStats stats={stats} />
      <AcessoRapido onNavegar={onNavegar} onPrecos={onPrecos} />
      <ListaCorridas corridas={corridas} />
    </div>
  );
}
