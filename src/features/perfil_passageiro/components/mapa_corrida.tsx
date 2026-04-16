import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL_DARK, TILE_ATTRIBUTION } from "@/features/passageiro/constants/constantes_passageiro";

interface MapaCorridaProps {
  origem: { lat: number; lng: number } | null;
  destino: { lat: number; lng: number } | null;
}

export function MapaCorrida({ origem, destino }: MapaCorridaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = origem ?? destino ?? { lat: -23.55, lng: -46.63 };
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer(TILE_URL_DARK, { attribution: TILE_ATTRIBUTION }).addTo(map);

    const criarIcone = (cor: string) =>
      L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${cor};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

    const pontos: L.LatLngExpression[] = [];

    if (origem) {
      L.marker([origem.lat, origem.lng], { icon: criarIcone("#1db865") }).addTo(map);
      pontos.push([origem.lat, origem.lng]);
    }

    if (destino) {
      L.marker([destino.lat, destino.lng], { icon: criarIcone("#888") }).addTo(map);
      pontos.push([destino.lat, destino.lng]);
    }

    if (origem && destino) {
      L.polyline(
        [
          [origem.lat, origem.lng],
          [destino.lat, destino.lng],
        ],
        { color: "#1db865", weight: 4, opacity: 0.85, dashArray: "6 8" }
      ).addTo(map);

      map.fitBounds(L.latLngBounds(pontos as L.LatLngTuple[]), { padding: [40, 40] });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [origem, destino]);

  return <div ref={containerRef} className="w-full h-48 rounded-xl overflow-hidden border border-border" />;
}
