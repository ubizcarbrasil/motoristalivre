import { CardMotoristaAceito } from "./card_motorista_aceito";
import { ChipsVeiculo } from "./chips_veiculo";
import { CronometroEtapas } from "./cronometro_etapas";
import { BotoesAcaoCorrida } from "./botoes_acao_corrida";
import { AvaliacoesMotorista } from "./avaliacoes_motorista";
import type { CorridaAceita } from "../types/tipos_passageiro";

interface SheetCorridaAceitaProps {
  corrida: CorridaAceita;
  onRastrear: () => void;
  onChat: () => void;
}

export function SheetCorridaAceita({ corrida, onRastrear, onChat }: SheetCorridaAceitaProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-background rounded-t-2xl border-t border-border shadow-2xl">
      <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2" />

      <div className="px-5 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <CardMotoristaAceito motorista={corrida.motorista} />
        <ChipsVeiculo veiculo={corrida.motorista.veiculo} />
        <CronometroEtapas
          status={corrida.status}
          acceptedAt={corrida.accepted_at}
          estimatedMin={corrida.estimated_min}
        />
        <BotoesAcaoCorrida
          telefone={corrida.motorista.telefone}
          onRastrear={onRastrear}
          onChat={onChat}
        />
        <AvaliacoesMotorista avaliacoes={corrida.avaliacoes} />
      </div>
    </div>
  );
}
