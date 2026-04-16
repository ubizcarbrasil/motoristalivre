import { ArrowLeft, Calendar, Car, Clock, CreditCard, Loader2, MapPin, Navigation, RefreshCw, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDetalhesCorrida } from "../hooks/hook_detalhes_corrida";
import { STATUS_CORRIDA_LABELS } from "../types/tipos_perfil_passageiro";
import type { EnderecoCorrida } from "../types/tipos_perfil_passageiro";
import { MapaCorrida } from "./mapa_corrida";
import { BotaoComprovanteCorrida } from "./botao_comprovante_corrida";

interface TelaDetalhesCorridaProps {
  rideId: string;
  isRideRequest: boolean;
  nomePassageiro: string;
  onVoltar: () => void;
  onPedirNovamente?: (origem: EnderecoCorrida, destino: EnderecoCorrida) => void;
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGAMENTO_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  saldo: "Saldo",
};

function LinhaInfo({
  icone: Icone,
  label,
  valor,
}: {
  icone: typeof Clock;
  label: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <Icone className="w-4 h-4 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-foreground truncate">{valor}</p>
      </div>
    </div>
  );
}

export function TelaDetalhesCorrida({ rideId, isRideRequest, nomePassageiro, onVoltar, onPedirNovamente }: TelaDetalhesCorridaProps) {
  const { detalhes, carregando } = useDetalhesCorrida(rideId, isRideRequest);

  const podePedirNovamente =
    !!onPedirNovamente &&
    detalhes !== null &&
    detalhes.origin_lat !== null &&
    detalhes.origin_lng !== null &&
    detalhes.dest_lat !== null &&
    detalhes.dest_lng !== null &&
    !!detalhes.origin_address &&
    !!detalhes.dest_address;

  const handlePedirNovamente = () => {
    if (!podePedirNovamente || !detalhes) return;
    onPedirNovamente!(
      {
        coordenada: { lat: detalhes.origin_lat!, lng: detalhes.origin_lng! },
        endereco: detalhes.origin_address!,
      },
      {
        coordenada: { lat: detalhes.dest_lat!, lng: detalhes.dest_lng! },
        endereco: detalhes.dest_address!,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onVoltar}
          className="h-9 w-9 shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Detalhes da corrida</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {carregando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !detalhes ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Corrida não encontrada
          </p>
        ) : (
          <>
            {/* Status + data */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatarDataHora(detalhes.created_at)}
              </p>
              <span
                className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_CORRIDA_LABELS[detalhes.status].cor}`}
              >
                {STATUS_CORRIDA_LABELS[detalhes.status].label}
              </span>
            </div>

            {/* Mapa */}
            <MapaCorrida
              origem={
                detalhes.origin_lat !== null && detalhes.origin_lng !== null
                  ? { lat: detalhes.origin_lat, lng: detalhes.origin_lng }
                  : null
              }
              destino={
                detalhes.dest_lat !== null && detalhes.dest_lng !== null
                  ? { lat: detalhes.dest_lat, lng: detalhes.dest_lng }
                  : null
              }
            />

            {/* Endereços */}
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              {detalhes.origin_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Origem</p>
                    <p className="text-xs text-foreground">{detalhes.origin_address}</p>
                  </div>
                </div>
              )}
              {detalhes.dest_address && (
                <div className="flex items-start gap-3">
                  <Navigation className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Destino</p>
                    <p className="text-xs text-foreground">{detalhes.dest_address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas */}
            <div className="rounded-xl bg-card border border-border p-3 grid grid-cols-2 gap-2">
              {detalhes.distance_km !== null && (
                <LinhaInfo
                  icone={Route}
                  label="Distância"
                  valor={`${detalhes.distance_km.toFixed(1).replace(".", ",")} km`}
                />
              )}
              {(detalhes.duration_min ?? detalhes.estimated_min) !== null && (
                <LinhaInfo
                  icone={Clock}
                  label={detalhes.duration_min ? "Duração" : "Estimativa"}
                  valor={`${detalhes.duration_min ?? detalhes.estimated_min} min`}
                />
              )}
              {detalhes.payment_method && (
                <LinhaInfo
                  icone={CreditCard}
                  label="Pagamento"
                  valor={PAGAMENTO_LABELS[detalhes.payment_method] ?? detalhes.payment_method}
                />
              )}
              {detalhes.completed_at && (
                <LinhaInfo
                  icone={Calendar}
                  label="Concluída em"
                  valor={new Date(detalhes.completed_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              )}
            </div>

            {/* Motorista */}
            {detalhes.motorista.id && (
              <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Motorista</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                    {detalhes.motorista.avatar ? (
                      <img
                        src={detalhes.motorista.avatar}
                        alt={detalhes.motorista.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-semibold text-foreground">
                        {detalhes.motorista.nome.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {detalhes.motorista.nome}
                    </p>
                    {detalhes.motorista.veiculo_modelo && (
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {detalhes.motorista.veiculo_modelo}
                        {detalhes.motorista.veiculo_cor ? ` · ${detalhes.motorista.veiculo_cor}` : ""}
                        {detalhes.motorista.veiculo_placa ? ` · ${detalhes.motorista.veiculo_placa}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Valor */}
            {detalhes.price_paid !== null && (
              <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Valor pago</span>
                <span className="text-xl font-bold text-primary">
                  R$ {detalhes.price_paid.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-2">
              <BotaoComprovanteCorrida detalhes={detalhes} nomePassageiro={nomePassageiro} />
              {podePedirNovamente && (
                <Button
                  onClick={handlePedirNovamente}
                  className="w-full h-12 gap-2 font-semibold"
                >
                  <RefreshCw className="w-4 h-4" />
                  Pedir novamente
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
