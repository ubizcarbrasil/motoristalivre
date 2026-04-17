import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Mapa } from "../components/mapa";
import { BottomSheet } from "../components/bottom_sheet";
import { ChipEta } from "../components/chip_eta";
import { OverlayBuscaMapa } from "../components/overlay_busca_mapa";
import { SheetInstalacao } from "../components/sheet_instalacao";
import { SheetCorridaAceita } from "../components/sheet_corrida_aceita";
import { DialogoDadosPassageiro } from "../components/dialogo_dados_passageiro";
import { BotaoInstalarPwa } from "../components/botao_instalar_pwa";
import { useSolicitacao } from "../hooks/hook_solicitacao";
import { useCorridaAceita } from "../hooks/hook_corrida_aceita";
import { useRastreamento } from "../hooks/hook_rastreamento";
import { existeAvaliacao } from "../services/servico_avaliacao";
import { useFavoritos } from "@/features/favoritos_passageiro/hooks/hook_favoritos";
import { useDestinosRecentes } from "@/features/favoritos_passageiro/hooks/hook_recentes";
import { DialogoEditarFavorito } from "@/features/favoritos_passageiro/components/dialogo_editar_favorito";
import type { TipoFavorito, FavoritoEndereco } from "@/features/favoritos_passageiro/types/tipos_favoritos";
import type { EnderecoCompleto } from "../types/tipos_passageiro";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

// Lazy imports — componentes pesados que não aparecem na renderização inicial
const TelaRastreamento = lazy(() =>
  import("../components/tela_rastreamento").then((m) => ({ default: m.TelaRastreamento }))
);
const TelaChat = lazy(() =>
  import("@/compartilhados/components/chat/tela_chat").then((m) => ({ default: m.TelaChat }))
);
const TelaAvaliacao = lazy(() =>
  import("../components/tela_avaliacao").then((m) => ({ default: m.TelaAvaliacao }))
);
const ListaMotoristasTenant = lazy(() =>
  import("../components/lista_motoristas_tenant").then((m) => ({ default: m.ListaMotoristasTenant }))
);
const SeletorLocalMapa = lazy(() =>
  import("../components/seletor_local_mapa").then((m) => ({ default: m.SeletorLocalMapa }))
);
const PaginaPerfilPassageiro = lazy(() => import("@/features/perfil_passageiro/pages/pagina_perfil_passageiro"));


export default function PaginaPassageiro() {
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
    confirmarCorridaGuest,
    onSalvarDadosGuestEBuscar,
    dadosGuest,
    precisaDadosGuest,
    fecharDadosGuest,
    voltarParaEnderecos,
    confirmando,
    cancelando,
    cancelarSolicitacao,
    grupoNome,
    rideRequestId,
    guestPassengerId,
    passengerId,
    resetarSolicitacao,
    rota: rotaAtual,
  } = useSolicitacao();


  const tenantId = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
  const favoritosCtx = useFavoritos({ passengerId, tenantId });
  const recentesCtx = useDestinosRecentes({ passengerId });

  const corridaAceita = useCorridaAceita(passengerId, rideRequestId, guestPassengerId);
  const [mostraRastreamento, setMostraRastreamento] = useState(false);
  const [mostraChat, setMostraChat] = useState(false);
  const [mostraPerfil, setMostraPerfil] = useState(false);
  const [seletorMapa, setSeletorMapa] = useState<{ aberto: boolean; alvo: "origem" | "destino" }>({
    aberto: false,
    alvo: "origem",
  });
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

  useEffect(() => {
    if (corridaAceita && (etapa === "buscando" || etapa === "aceita")) {
      setEtapa("aceita");
    }
  }, [corridaAceita, etapa, setEtapa]);

  useEffect(() => {
    if (!corridaAceita) return;
    if (corridaAceita.status === "completed" && corridaAceita.ride_id && passengerId) {
      setMostraRastreamento(false);
      setMostraChat(false);
      const rideId = corridaAceita.ride_id;
      const motoristaCorrida = corridaAceita.motorista;
      existeAvaliacao(rideId, passengerId).then((jaAvaliou) => {
        if (jaAvaliou) {
          resetarSolicitacao();
        } else {
          setAvaliacaoPendente({
            ride_id: rideId,
            driver_id: motoristaCorrida.id,
            nome: motoristaCorrida.nome,
            avatar: motoristaCorrida.avatar_url,
          });
        }
      });
    } else if (corridaAceita.status === "completed" && !passengerId) {
      // Guest: corrida concluída → reseta sem avaliação
      setMostraRastreamento(false);
      setMostraChat(false);
      toast.success("Corrida concluída! Obrigado por usar o TriboCar.");
      resetarSolicitacao();
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
      if (!origem) {
        setOrigem(enderecoCompleto);
        toast.success(`${f.label} definido como origem`);
      } else if (!destino) {
        setDestino(enderecoCompleto);
        toast.success(`${f.label} definido como destino`);
      } else {
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

  const abrirSeletorMapa = useCallback((alvo: "origem" | "destino") => {
    setSeletorMapa({ aberto: true, alvo });
  }, []);

  const confirmarLocalDoMapa = useCallback(
    (endereco: EnderecoCompleto) => {
      if (seletorMapa.alvo === "origem") {
        setOrigem(endereco);
      } else {
        setDestino(endereco);
      }
      setSeletorMapa({ aberto: false, alvo: seletorMapa.alvo });
    },
    [seletorMapa.alvo, setOrigem, setDestino]
  );

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (tenantSemMotorista) {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
        <ListaMotoristasTenant tenantSlug={tenantSemMotorista} />
      </Suspense>
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

  const centroSeletor =
    seletorMapa.alvo === "origem"
      ? origem?.coordenada ?? null
      : destino?.coordenada ?? origem?.coordenada ?? null;

  return (
    <div className="fixed inset-0 bg-background overflow-hidden min-h-dvh">
      <Mapa
        origem={origem}
        destino={destino}
        rota={rota}
        centro={origem?.coordenada ?? undefined}
      />

      {etapa !== "buscando" && etapa !== "aceita" && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-4 safe-area-top">
          <BotaoInstalarPwa />
          {passengerId && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setMostraPerfil(true)}
              className="h-10 w-10 rounded-full shadow-lg"
              aria-label="Meu perfil"
            >
              <User className="w-5 h-5" />
            </Button>
          )}
        </div>
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
          onEscolherNoMapa={abrirSeletorMapa}
        />
      )}

      {etapa === "buscando" && !corridaAceita && (
        <OverlayBuscaMapa
          grupoNome={grupoNome}
          onCancelar={cancelarSolicitacao}
          cancelando={cancelando}
        />
      )}

      {etapa === "aceita" && corridaAceita && !mostraRastreamento && !mostraChat && (
        <SheetCorridaAceita
          corrida={corridaAceita}
          onRastrear={abrirRastreamento}
          onChat={() => setMostraChat(true)}
        />
      )}

      <Suspense fallback={null}>
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
      </Suspense>


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

      <DialogoDadosPassageiro
        aberto={precisaDadosGuest}
        onFechar={fecharDadosGuest}
        onConfirmar={rotaAtual ? confirmarCorridaGuest : onSalvarDadosGuestEBuscar}
        enviando={confirmando || carregandoRota}
        textoBotao={rotaAtual ? "Chamar motorista" : "Continuar"}
        valorInicial={dadosGuest ? { nome: dadosGuest.nome, whatsapp: dadosGuest.whatsapp } : undefined}
      />

      <SeletorLocalMapa
        aberto={seletorMapa.aberto}
        titulo={seletorMapa.alvo === "origem" ? "Definir origem" : "Definir destino"}
        centroInicial={centroSeletor}
        onConfirmar={confirmarLocalDoMapa}
        onFechar={() => setSeletorMapa((s) => ({ ...s, aberto: false }))}
      />

      <SheetInstalacao />
    </div>
  );
}
