import { useCallback } from "react";
import { Mapa } from "../components/mapa";
import { BottomSheet } from "../components/bottom_sheet";
import { ChipEta } from "../components/chip_eta";
import { OverlayBusca } from "../components/overlay_busca";
import { SheetInstalacao } from "../components/sheet_instalacao";
import { useSolicitacao } from "../hooks/hook_solicitacao";
import { Loader2 } from "lucide-react";

export default function PaginaPassageiro() {
  const {
    tipoOrigem,
    motorista,
    afiliado,
    carregando,
    erro,
    origem,
    setOrigem,
    destino,
    setDestino,
    rota,
    carregandoRota,
    buscarRotaCallback,
    etapa,
    veiculoSelecionado,
    setVeiculoSelecionado,
    valorOferta,
    setValorOferta,
    precos,
    confirmarCorrida,
    voltarParaEnderecos,
    grupoNome,
  } = useSolicitacao();

  const geolocalizarOrigem = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigem({
          coordenada: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          endereco: "Minha localização",
        });
      },
      () => {}
    );
  }, [setOrigem]);

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Link não encontrado</p>
          <p className="text-sm text-muted-foreground">Verifique se o endereço está correto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <Mapa
        origem={origem}
        destino={destino}
        rota={rota}
        centro={origem?.coordenada ?? undefined}
      />

      {rota && etapa === "veiculo" && <ChipEta rota={rota} />}

      {etapa !== "buscando" && (
        <BottomSheet
          tipoOrigem={tipoOrigem}
          motorista={motorista}
          afiliado={afiliado}
          grupoNome={grupoNome}
          etapa={etapa}
          origem={origem}
          destino={destino}
          onSelecionarOrigem={setOrigem}
          onSelecionarDestino={setDestino}
          onGeolocalizarOrigem={geolocalizarOrigem}
          onBuscarMotoristas={buscarRotaCallback}
          carregandoRota={carregandoRota}
          precos={precos}
          veiculoSelecionado={veiculoSelecionado}
          onSelecionarVeiculo={setVeiculoSelecionado}
          valorOferta={valorOferta}
          onMudarOferta={setValorOferta}
          onConfirmar={confirmarCorrida}
          onVoltarEnderecos={voltarParaEnderecos}
        />
      )}

      {etapa === "buscando" && <OverlayBusca grupoNome={grupoNome} />}

      <SheetInstalacao />
    </div>
  );
}
