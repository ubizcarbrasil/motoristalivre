import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Navigation, ExternalLink, Radio } from "lucide-react";
import { TILE_URL_DARK, TILE_ATTRIBUTION, COORDENADA_PADRAO } from "../constants/constantes_passageiro";
import type { Coordenada } from "../types/tipos_passageiro";

interface TelaRastreamentoProps {
  posicaoMotorista: { lat: number; lng: number } | null;
  posicaoPassageiro: Coordenada | null;
  distanciaKm: number | null;
  etaMin: number | null;
  conectado: boolean;
  onVoltar: () => void;
}

export function TelaRastreamento({
  posicaoMotorista,
  posicaoPassageiro,
  distanciaKm,
  etaMin,
  conectado,
  onVoltar,
}: TelaRastreamentoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerMotoristaRef = useRef<L.Marker | null>(null);
  const markerPassageiroRef = useRef<L.Marker | null>(null);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center = posicaoPassageiro ?? COORDENADA_PADRAO;
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(TILE_URL_DARK, { attribution: TILE_ATTRIBUTION }).addTo(map);
    mapRef.current = map;

    // Passenger marker
    if (posicaoPassageiro) {
      markerPassageiroRef.current = L.marker([posicaoPassageiro.lat, posicaoPassageiro.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:#1db865;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }).addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update driver marker with animation
  useEffect(() => {
    if (!mapRef.current || !posicaoMotorista) return;
    const latlng: L.LatLngExpression = [posicaoMotorista.lat, posicaoMotorista.lng];

    if (!markerMotoristaRef.current) {
      markerMotoristaRef.current = L.marker(latlng, {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 12px rgba(59,130,246,0.5)"><div style="width:6px;height:6px;border-radius:50%;background:#fff;margin:3px auto"></div></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(mapRef.current);
    } else {
      // Smooth animation
      const start = markerMotoristaRef.current.getLatLng();
      const end = L.latLng(latlng);
      const steps = 20;
      let step = 0;
      const animate = () => {
        step++;
        const t = step / steps;
        const lat = start.lat + (end.lat - start.lat) * t;
        const lng = start.lng + (end.lng - start.lng) * t;
        markerMotoristaRef.current?.setLatLng([lat, lng]);
        if (step < steps) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }

    // Pan map to show both markers
    if (markerPassageiroRef.current) {
      const bounds = L.latLngBounds([
        markerPassageiroRef.current.getLatLng(),
        L.latLng(latlng),
      ]);
      mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
    } else {
      mapRef.current.panTo(latlng);
    }
  }, [posicaoMotorista]);

  const abrirGoogleMaps = () => {
    if (!posicaoMotorista) return;
    window.open(`https://maps.google.com/?q=${posicaoMotorista.lat},${posicaoMotorista.lng}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-40 bg-background">
      {/* Map */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center gap-3">
        <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={onVoltar}>
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
          {conectado ? (
            <>
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Tempo real ativo</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Aguardando localização…</span>
          )}
        </div>
      </div>

      {/* Bottom pills */}
      <div className="absolute bottom-6 left-4 right-4 z-50 space-y-3">
        {/* ETA / Distance */}
        {posicaoMotorista && (
          <div className="flex items-center justify-center gap-3">
            {distanciaKm !== null && (
              <div className="bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
                <span className="text-xs font-medium text-foreground">
                  {distanciaKm < 1
                    ? `${Math.round(distanciaKm * 1000)} m`
                    : `${distanciaKm.toFixed(1)} km`}
                </span>
              </div>
            )}
            {etaMin !== null && (
              <div className="bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
                <span className="text-xs font-medium text-foreground">
                  ~{etaMin} min
                </span>
              </div>
            )}
          </div>
        )}

        {/* Google Maps button */}
        <Button
          className="w-full gap-2"
          variant="secondary"
          onClick={abrirGoogleMaps}
          disabled={!posicaoMotorista}
        >
          <Navigation className="w-4 h-4" />
          Abrir no Google Maps
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </Button>
      </div>
    </div>
  );
}
