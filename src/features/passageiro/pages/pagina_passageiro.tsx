import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mapa } from "../components/mapa";
import { BottomSheet } from "../components/bottom_sheet";
import { ChipEta } from "../components/chip_eta";
import { OverlayBusca } from "../components/overlay_busca";
import { SheetInstalacao } from "../components/sheet_instalacao";
import { SheetCorridaAceita } from "../components/sheet_corrida_aceita";
import { TelaRastreamento } from "../components/tela_rastreamento";
import { TelaChat } from "@/compartilhados/components/chat/tela_chat";
import { TelaAvaliacao } from "../components/tela_avaliacao";
import { ListaMotoristasTenant } from "../components/lista_motoristas_tenant";
import { BannerLoginNecessario } from "../components/banner_login_necessario";
import { useSolicitacao } from "../hooks/hook_solicitacao";
import { useCorridaAceita } from "../hooks/hook_corrida_aceita";
import { useRastreamento } from "../hooks/hook_rastreamento";
import { existeAvaliacao } from "../services/servico_avaliacao";
import { useFavoritos } from "@/features/favoritos_passageiro/hooks/hook_favoritos";
import { useDestinosRecentes } from "@/features/favoritos_passageiro/hooks/hook_recentes";
import { DialogoEditarFavorito } from "@/features/favoritos_passageiro/components/dialogo_editar_favorito";
import type { TipoFavorito, FavoritoEndereco } from "@/features/favoritos_passageiro/types/tipos_favoritos";
import PaginaPerfilPassageiro from "@/features/perfil_passageiro/pages/pagina_perfil_passageiro";
import { Button } from "@/components/ui/button";
import { Loader2, User, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { useEhMotorista } from "../hooks/hook_eh_motorista";

export default function PaginaPassageiro() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tipoOrigem,
    motorista,
    afiliado,
    carregando,
    erro,
    tenantSemMotorista,
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

  const tenantId = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
  const favoritosCtx = useFavoritos({ passengerId, tenantId });
  const recentesCtx = useDestinosRecentes({ passengerId });

  const corridaAceita = useCorridaAceita(passengerId, rideRequestId);
  const { mostrarBotaoPainel, rotaPainel } = useEhMotorista();
  const [mostraRastreamento, setMostraRastreamento] = useState(false);
  const [mostraChat, setMostraChat] = useState(false);
  const [mostraPerfil, setMostraPerfil] = useState(false);
  const [favoritoDialogo, setFavoritoDialogo] = useState<{
    aberto: boolean;
    tipoSugerido?: TipoFavorito;
    enderecoInicial?: { address: string; lat: number; lng: number } | null;
  }>({ aberto: false });
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
    if (corridaAceita.status === "completed" && corridaAceita.ride_id && passengerId) {
      setMostraRastreamento(false);
      setMostraChat(false);
      const rideId = corridaAceita.ride_id;
      const motorista = corridaAceita.motorista;
      existeAvaliacao(rideId, passengerId).then((jaAvaliou) => {
        if (jaAvaliou) {
          resetarSolicitacao();
        } else {
          setAvaliacaoPendente({
            ride_id: rideId,
            driver_id: motorista.id,
            nome: motorista.nome,
            avatar: motorista.avatar_url,
          });
        }
      });
    } else if (corridaAceita.status === "cancelled" || corridaAceita.status === "expired") {
      setMostraRastreamento(false);
      setMostraChat(false);
      resetarSolicitacao();
    }
  }, [corridaAceita?.status, corridaAceita?.ride_id, passengerId, resetarSolicitacao]);

  const concluirAvaliacao = useCallback(() => {
    setAvaliacaoPendente(null);
    resetarSolicitacao();
    recentesCtx.recarregar();
  }, [resetarSolicitacao, recentesCtx]);

  const abrirRastreamento = useCallback(() => {
    rastreamento.conectar();
    setMostraRastreamento(true);
  }, [rastreamento]);

  const fecharRastreamento = useCallback(() => {
    setMostraRastreamento(false);
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

  const usarFavoritoComoCampo = useCallback(
    (f: FavoritoEndereco) => {
      const enderecoCompleto = {
        coordenada: { lat: f.lat, lng: f.lng },
        endereco: f.address,
      };
      // Preenche origem se vazia, senão preenche destino
      if (!origem) {
        setOrigem(enderecoCompleto);
        toast.success(`${f.label} definido como origem`);
      } else if (!destino) {
        setDestino(enderecoCompleto);
        toast.success(`${f.label} definido como destino`);
      } else {
        // Ambos preenchidos: substitui destino
        setDestino(enderecoCompleto);
        toast.success(`Destino atualizado para ${f.label}`);
      }
    },
    [origem, destino, setOrigem, setDestino]
  );

  const abrirDialogoFavorito = useCallback(
    (tipo: TipoFavorito, enderecoInicial?: { address: string; lat: number; lng: number }) => {
      if (!passengerId) {
        toast.error("Você precisa estar logado para favoritar");
        return;
      }
      setFavoritoDialogo({ aberto: true, tipoSugerido: tipo, enderecoInicial });
    },
    [passengerId]
  );

  const favoritarEndereco = useCallback(
    (endereco: { address: string; lat: number; lng: number }) => {
      const ja = favoritosCtx.eFavorito(endereco.lat, endereco.lng, endereco.address);
      if (ja) {
        toast.info(`Já favoritado como "${ja.label}"`);
        return;
      }
      abrirDialogoFavorito("other", endereco);
    },
    [favoritosCtx, abrirDialogoFavorito]
  );

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (tenantSemMotorista) {
    return <ListaMotoristasTenant tenantSlug={tenantSemMotorista} />;
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

      {passengerId && etapa !== "buscando" && etapa !== "aceita" && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {mostrarBotaoPainel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(rotaPainel)}
              className="h-10 rounded-full shadow-lg gap-1.5 px-3"
              aria-label="Voltar ao painel"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs font-medium">Painel</span>
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setMostraPerfil(true)}
            className="h-10 w-10 rounded-full shadow-lg"
            aria-label="Meu perfil"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      )}

      {!passengerId && etapa !== "buscando" && etapa !== "aceita" && (
        <BannerLoginNecessario />
      )}

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
          favoritos={passengerId ? favoritosCtx.favoritos : []}
          recentes={passengerId ? recentesCtx.recentes : []}
          onUsarFavorito={passengerId ? usarFavoritoComoCampo : undefined}
          onAdicionarFavoritoTipo={passengerId ? (t) => abrirDialogoFavorito(t) : undefined}
          onFavoritarEndereco={passengerId ? favoritarEndereco : undefined}
          identificarFavorito={passengerId ? favoritosCtx.eFavorito : undefined}
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

      {mostraPerfil && passengerId && (
        <PaginaPerfilPassageiro
          userId={passengerId}
          onVoltar={() => setMostraPerfil(false)}
          onPedirNovamente={(novaOrigem, novoDestino) => {
            setOrigem(novaOrigem);
            setDestino(novoDestino);
            setEtapa("endereco");
            setMostraPerfil(false);
            toast.success("Endereços preenchidos. Confirme para buscar motoristas.");
          }}
        />
      )}

      <DialogoEditarFavorito
        aberto={favoritoDialogo.aberto}
        onFechar={() => setFavoritoDialogo({ aberto: false })}
        tipoSugerido={favoritoDialogo.tipoSugerido}
        enderecoInicial={favoritoDialogo.enderecoInicial ?? null}
        onSalvar={async (dados) => {
          const ok = await favoritosCtx.adicionar(dados);
          return ok;
        }}
      />

      <SheetInstalacao />
    </div>
  );
}
