import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { CampoEndereco } from "./campo_endereco";
import { StripMotorista } from "./strip_motorista";
import { SeletorVeiculo } from "./seletor_veiculo";
import { ChipsFavoritosRapidos } from "@/features/favoritos_passageiro/components/chips_favoritos_rapidos";
import { saudacaoPorHorario } from "../utils/utilitarios_passageiro";
import type { FavoritoEndereco, TipoFavorito } from "@/features/favoritos_passageiro/types/tipos_favoritos";
import type { EnderecoRecente } from "@/features/favoritos_passageiro/types/tipos_recentes";
import type {
  DadosMotorista,
  DadosAfiliado,
  EnderecoCompleto,
  PrecoCalculado,
  EtapaSolicitacao,
  TipoOrigem,
  FormaPagamento,
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
  formaPagamento: FormaPagamento;
  onMudarFormaPagamento: (f: FormaPagamento) => void;
  onConfirmar: () => void;
  onVoltarEnderecos: () => void;
  confirmando?: boolean;
  favoritos?: FavoritoEndereco[];
  recentes?: EnderecoRecente[];
  onUsarFavorito?: (favorito: FavoritoEndereco) => void;
  onAdicionarFavoritoTipo?: (tipo: TipoFavorito) => void;
  onFavoritarEndereco?: (endereco: { address: string; lat: number; lng: number }) => void;
  identificarFavorito?: (lat: number, lng: number, endereco: string) => FavoritoEndereco | undefined;
  onEscolherNoMapa?: (alvo: "origem" | "destino") => void;
}

export function BottomSheet({
  tipoOrigem,
  motorista,
  afiliado,
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
  formaPagamento,
  onMudarFormaPagamento,
  onConfirmar,
  onVoltarEnderecos,
  confirmando = false,
  favoritos = [],
  recentes = [],
  onUsarFavorito,
  onAdicionarFavoritoTipo,
  onFavoritarEndereco,
  identificarFavorito,
  onEscolherNoMapa,
}: BottomSheetProps) {
  const podeBuscar = origem !== null && destino !== null && !carregandoRota;
  const mostrarChipsFavoritos =
    etapa === "endereco" && onUsarFavorito && onAdicionarFavoritoTipo;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-background rounded-t-2xl border-t border-border shadow-2xl">
      <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2" />

      <div className="px-5 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 max-h-[75vh] overflow-y-auto">
        <p className="text-lg font-semibold text-foreground">{saudacaoPorHorario()}</p>

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

        {etapa === "endereco" && (
          <>
            {mostrarChipsFavoritos && (
              <ChipsFavoritosRapidos
                favoritos={favoritos}
                onUsar={onUsarFavorito!}
                onAdicionarTipo={onAdicionarFavoritoTipo!}
              />
            )}

            <div className="space-y-2">
              <CampoEndereco
                tipo="origem"
                valor={origem}
                onSelecionar={onSelecionarOrigem}
                placeholder="De onde?"
                onGeolocalizarOrigem={onGeolocalizarOrigem}
                favoritos={favoritos}
                recentes={recentes}
                onFavoritarResultado={onFavoritarEndereco}
                identificarFavorito={identificarFavorito}
              />
              <CampoEndereco
                tipo="destino"
                valor={destino}
                onSelecionar={onSelecionarDestino}
                placeholder="Para onde?"
                favoritos={favoritos}
                recentes={recentes}
                onFavoritarResultado={onFavoritarEndereco}
                identificarFavorito={identificarFavorito}
              />
            </div>

            {onEscolherNoMapa && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEscolherNoMapa("origem")}
                  className="flex-1 h-9 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  Origem no mapa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEscolherNoMapa("destino")}
                  className="flex-1 h-9 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  Destino no mapa
                </Button>
              </div>
            )}

            <Button
              onClick={onBuscarMotoristas}
              disabled={!podeBuscar}
              className="w-full h-12 font-semibold"
            >
              {carregandoRota ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
            formaPagamento={formaPagamento}
            onMudarFormaPagamento={onMudarFormaPagamento}
            onConfirmar={onConfirmar}
            onVoltar={onVoltarEnderecos}
            confirmando={confirmando}
          />
        )}
      </div>
    </div>
  );
}
