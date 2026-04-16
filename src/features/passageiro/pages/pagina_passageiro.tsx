import { useCallback, useEffect, useState } from "react";
import { Mapa } from "../components/mapa";
import { BottomSheet } from "../components/bottom_sheet";
import { ChipEta } from "../components/chip_eta";
import { OverlayBusca } from "../components/overlay_busca";
import { SheetInstalacao } from "../components/sheet_instalacao";
import { SheetCorridaAceita } from "../components/sheet_corrida_aceita";
import { TelaRastreamento } from "../components/tela_rastreamento";
import { useSolicitacao } from "../hooks/hook_solicitacao";
import { useCorridaAceita } from "../hooks/hook_corrida_aceita";
import { useRastreamento } from "../hooks/hook_rastreamento";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    setEtapa,
    veiculoSelecionado,
    setVeiculoSelecionado,
    valorOferta,
    setValorOferta,
    precos,
    formaPagamento,
    setFormaPagamento,
    confirmarCorrida,
    voltarParaEnderecos,
    confirmando,
    grupoNome,
    rideRequestId,
    passengerId,
  } = useSolicitacao();

  const corridaAceita = useCorridaAceita(passengerId, rideRequestId);
  const [mostraRastreamento, setMostraRastreamento] = useState(false);

  const rastreamento = useRastreamento(
    corridaAceita?.ride_id ?? null,
    corridaAceita?.status,
    origem?.coordenada ?? null
  );

  // Quando a corrida é aceita, transiciona para o Estado 3
  useEffect(() => {
    if (corridaAceita && (etapa === "buscando" || etapa === "aceita")) {
      setEtapa("aceita");
    }
  }, [corridaAceita, etapa, setEtapa]);

  // Fechar rastreamento se corrida terminou
  useEffect(() => {
    if (corridaAceita?.status === "completed" || corridaAceita?.status === "cancelled") {
      setMostraRastreamento(false);
    }
  }, [corridaAceita?.status]);

  const abrirRastreamento = useCallback(() => {
    rastreamento.conectar();
    setMostraRastreamento(true);
  }, [rastreamento]);

  const fecharRastreamento = useCallback(() => {
    setMostraRastreamento(false);
    // Keep connection alive so pills update in background
  }, []);

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

      {etapa !== "buscando" && etapa !== "aceita" && (
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
          formaPagamento={formaPagamento}
          onMudarFormaPagamento={setFormaPagamento}
          onConfirmar={confirmarCorrida}
          onVoltarEnderecos={voltarParaEnderecos}
          confirmando={confirmando}
        />
      )}

      {etapa === "buscando" && !corridaAceita && <OverlayBusca grupoNome={grupoNome} />}

      {etapa === "aceita" && corridaAceita && !mostraRastreamento && (
        <SheetCorridaAceita
          corrida={corridaAceita}
          onRastrear={abrirRastreamento}
          onChat={() => toast.info("Chat em breve")}
        />
      )}

      {mostraRastreamento && (
        <TelaRastreamento
          posicaoMotorista={rastreamento.posicao}
          posicaoPassageiro={origem?.coordenada ?? null}
          distanciaKm={rastreamento.distanciaKm}
          etaMin={rastreamento.etaMin}
          conectado={rastreamento.conectado}
          onVoltar={fecharRastreamento}
        />
      )}

      <SheetInstalacao />
    </div>
  );
}
