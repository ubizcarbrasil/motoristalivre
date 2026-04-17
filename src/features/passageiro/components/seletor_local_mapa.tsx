import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { X, Loader2, MapPin } from "lucide-react";
import {
  TILE_URL_DARK,
  TILE_ATTRIBUTION,
  COORDENADA_PADRAO,
} from "../constants/constantes_passageiro";
import { reverseGeocodingNominatim } from "../services/servico_passageiro";
import type { Coordenada, EnderecoCompleto } from "../types/tipos_passageiro";

interface SeletorLocalMapaProps {
  aberto: boolean;
  titulo: string;
  centroInicial?: Coordenada | null;
  onConfirmar: (endereco: EnderecoCompleto) => void;
  onFechar: () => void;
}

export function SeletorLocalMapa({
  aberto,
  titulo,
  centroInicial,
  onConfirmar,
  onFechar,
}: SeletorLocalMapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [coordenada, setCoordenada] = useState<Coordenada | null>(null);
  const [endereco, setEndereco] = useState<string>("");
  const [carregandoEndereco, setCarregandoEndereco] = useState(false);

  useEffect(() => {
    if (!aberto || !containerRef.current || mapRef.current) return;

    const centro = centroInicial ?? COORDENADA_PADRAO;
    const map = L.map(containerRef.current, {
      center: [centro.lat, centro.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL_DARK, { attribution: TILE_ATTRIBUTION }).addTo(map);

    const atualizar = () => {
      const c = map.getCenter();
      setCoordenada({ lat: c.lat, lng: c.lng });
    };

    map.on("moveend", atualizar);
    atualizar();
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [aberto, centroInicial]);

  // Reverse geocoding com debounce ao parar movimento
  useEffect(() => {
    if (!coordenada) return;
    let cancelado = false;
    setCarregandoEndereco(true);
    const t = setTimeout(async () => {
      const resultado = await reverseGeocodingNominatim(coordenada.lat, coordenada.lng);
      if (cancelado) return;
      setEndereco(resultado ?? `${coordenada.lat.toFixed(5)}, ${coordenada.lng.toFixed(5)}`);
      setCarregandoEndereco(false);
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [coordenada]);

  if (!aberto) return null;

  const confirmar = () => {
    if (!coordenada) return;
    onConfirmar({
      coordenada,
      endereco: endereco || `${coordenada.lat.toFixed(5)}, ${coordenada.lng.toFixed(5)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col min-h-dvh">
      {/* Header */}
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border bg-card/95 backdrop-blur-md z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onFechar}
          aria-label="Fechar"
          className="h-9 w-9"
        >
          <X className="w-5 h-5" />
        </Button>
        <p className="font-semibold text-foreground">{titulo}</p>
      </div>

      {/* Mapa */}
      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Pino fixo no centro da tela */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
          <div className="flex flex-col items-center">
            <MapPin className="w-9 h-9 text-primary drop-shadow-lg" fill="currentColor" />
            <div className="w-2 h-2 rounded-full bg-primary -mt-1 shadow-lg" />
          </div>
        </div>
      </div>

      {/* Footer com endereço + botão */}
      <div className="border-t border-border bg-card px-4 pt-3 pb-4 safe-area-bottom space-y-3">
        <div className="min-h-[2.5rem] flex items-center">
          {carregandoEndereco ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando endereço...
            </div>
          ) : (
            <p className="text-sm text-foreground line-clamp-2">{endereco || "Mova o mapa"}</p>
          )}
        </div>
        <Button
          onClick={confirmar}
          disabled={!coordenada || carregandoEndereco}
          className="w-full h-12 font-semibold"
        >
          Confirmar este local
        </Button>
      </div>
    </div>
  );
}
