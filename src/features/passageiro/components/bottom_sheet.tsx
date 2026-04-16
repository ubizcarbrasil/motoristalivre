import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CampoEndereco } from "./campo_endereco";
import { StripMotorista } from "./strip_motorista";
import { SeletorVeiculo } from "./seletor_veiculo";
import { saudacaoPorHorario } from "../utils/utilitarios_passageiro";
import type {
  DadosMotorista,
  DadosAfiliado,
  EnderecoCompleto,
  PrecoCalculado,
  EtapaSolicitacao,
  TipoOrigem,
} from "../types/tipos_passageiro";

interface BottomSheetProps {
  tipoOrigem: TipoOrigem;
  motorista: DadosMotorista | null;
  afiliado: DadosAfiliado | null;
  grupoNome: string;
  etapa: EtapaSolicitacao;
  origem: EnderecoCompleto | null;
  destino: EnderecoCompleto | null;
  onSelecionarOrigem: (e: EnderecoCompleto) => void;
  onSelecionarDestino: (e: EnderecoCompleto) => void;
  onGeolocalizarOrigem: () => void;
  onBuscarMotoristas: () => void;
  carregandoRota: boolean;
  precos: PrecoCalculado[];
  veiculoSelecionado: string;
  onSelecionarVeiculo: (id: string) => void;
  valorOferta: number;
  onMudarOferta: (v: number) => void;
  onConfirmar: () => void;
  onVoltarEnderecos: () => void;
}

export function BottomSheet({
  tipoOrigem,
  motorista,
  afiliado,
  grupoNome,
  etapa,
  origem,
  destino,
  onSelecionarOrigem,
  onSelecionarDestino,
  onGeolocalizarOrigem,
  onBuscarMotoristas,
  carregandoRota,
  precos,
  veiculoSelecionado,
  onSelecionarVeiculo,
  valorOferta,
  onMudarOferta,
  onConfirmar,
  onVoltarEnderecos,
}: BottomSheetProps) {
  const podeBuscar = origem !== null && destino !== null && !carregandoRota;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-background rounded-t-2xl border-t border-border shadow-2xl">
      <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2" />

      <div className="px-5 pb-6 space-y-3 max-h-[70vh] overflow-y-auto">
        {/* Saudação */}
        <p className="text-lg font-semibold text-foreground">{saudacaoPorHorario()}</p>

        {/* Strip do motorista */}
        {tipoOrigem === "motorista" && motorista && (
          <StripMotorista motorista={motorista} />
        )}

        {tipoOrigem === "afiliado" && afiliado && (
          <div className="py-3">
            <p className="text-sm font-medium text-foreground">
              {afiliado.business_name ?? afiliado.nome}
            </p>
            <p className="text-xs text-muted-foreground">{afiliado.grupo_nome}</p>
          </div>
        )}

        {/* Endereços ou Veículos */}
        {etapa === "endereco" && (
          <>
            <div className="space-y-2">
              <CampoEndereco
                tipo="origem"
                valor={origem}
                onSelecionar={onSelecionarOrigem}
                placeholder="De onde?"
                onGeolocalizarOrigem={onGeolocalizarOrigem}
              />
              <CampoEndereco
                tipo="destino"
                valor={destino}
                onSelecionar={onSelecionarDestino}
                placeholder="Para onde?"
              />
            </div>

            <Button
              onClick={onBuscarMotoristas}
              disabled={!podeBuscar}
              className="w-full h-12 font-semibold"
            >
              {carregandoRota ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Buscar motoristas
            </Button>
          </>
        )}

        {etapa === "veiculo" && (
          <SeletorVeiculo
            precos={precos}
            veiculoSelecionado={veiculoSelecionado}
            onSelecionar={onSelecionarVeiculo}
            valorOferta={valorOferta}
            onMudarOferta={onMudarOferta}
            onConfirmar={onConfirmar}
            onVoltar={onVoltarEnderecos}
          />
        )}
      </div>
    </div>
  );
}
