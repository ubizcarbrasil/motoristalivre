import { useCallback, useEffect, useState } from "react";
import { Mapa } from "../components/mapa";
import { BottomSheet } from "../components/bottom_sheet";
import { ChipEta } from "../components/chip_eta";
import { OverlayBusca } from "../components/overlay_busca";
import { SheetInstalacao } from "../components/sheet_instalacao";
import { SheetCorridaAceita } from "../components/sheet_corrida_aceita";
import { TelaRastreamento } from "../components/tela_rastreamento";
import { TelaChat } from "@/compartilhados/components/chat/tela_chat";
import { TelaAvaliacao } from "../components/tela_avaliacao";
import { useSolicitacao } from "../hooks/hook_solicitacao";
import { useCorridaAceita } from "../hooks/hook_corrida_aceita";
import { useRastreamento } from "../hooks/hook_rastreamento";
import { existeAvaliacao } from "../services/servico_avaliacao";
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
    resetarSolicitacao,
  } = useSolicitacao();

  const corridaAceita = useCorridaAceita(passengerId, rideRequestId);
  const [mostraRastreamento, setMostraRastreamento] = useState(false);
  const [mostraChat, setMostraChat] = useState(false);
  const [avaliacaoPendente, setAvaliacaoPendente] = useState<{
    ride_id: string;
    driver_id: string;
    nome: string;
    avatar: string | null;
  } | null>(null);

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

  // Quando corrida termina: mostrar avaliação ou cancelar
  useEffect(() => {
    if (!corridaAceita) return;
    if (corridaAceita.status === "completed" && corridaAceita.ride_id) {
      setMostraRastreamento(false);
      setMostraChat(false);
      setAvaliacaoPendente({
        ride_id: corridaAceita.ride_id,
        driver_id: corridaAceita.motorista.id,
        nome: corridaAceita.motorista.nome,
        avatar: corridaAceita.motorista.avatar_url,
      });
    } else if (corridaAceita.status === "cancelled" || corridaAceita.status === "expired") {
      setMostraRastreamento(false);
      setMostraChat(false);
      resetarSolicitacao();
    }
  }, [corridaAceita?.status, corridaAceita?.ride_id, resetarSolicitacao]);

  const concluirAvaliacao = useCallback(() => {
    setAvaliacaoPendente(null);
    resetarSolicitacao();
  }, [resetarSolicitacao]);

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

      {etapa === "aceita" && corridaAceita && !mostraRastreamento && !mostraChat && (
        <SheetCorridaAceita
          corrida={corridaAceita}
          onRastrear={abrirRastreamento}
          onChat={() => setMostraChat(true)}
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

      {mostraChat && corridaAceita && passengerId && (
        <TelaChat
          rideId={corridaAceita.ride_id ?? ""}
          meuId={passengerId}
          meuPapel="passenger"
          outroNome={corridaAceita.motorista.nome}
          outroAvatar={corridaAceita.motorista.avatar_url}
          outroSubtitulo={`A caminho · ${corridaAceita.estimated_min} min`}
          outroTelefone={corridaAceita.motorista.telefone}
          onVoltar={() => setMostraChat(false)}
        />
      )}

      {avaliacaoPendente && passengerId && (
        <TelaAvaliacao
          rideId={avaliacaoPendente.ride_id}
          driverId={avaliacaoPendente.driver_id}
          passengerId={passengerId}
          motoristaNome={avaliacaoPendente.nome}
          motoristaAvatar={avaliacaoPendente.avatar}
          onConcluir={concluirAvaliacao}
        />
      )}

      <SheetInstalacao />
    </div>
  );
}
