import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL_DARK, TILE_ATTRIBUTION, COORDENADA_PADRAO } from "../constants/constantes_passageiro";
import type { Coordenada, DadosRota, EnderecoCompleto } from "../types/tipos_passageiro";

interface MapaProps {
  origem: EnderecoCompleto | null;
  destino: EnderecoCompleto | null;
  rota: DadosRota | null;
  centro?: Coordenada;
}

export function Mapa({ origem, destino, rota, centro }: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [centro?.lat ?? COORDENADA_PADRAO.lat, centro?.lng ?? COORDENADA_PADRAO.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL_DARK, { attribution: TILE_ATTRIBUTION }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualizar centro
  useEffect(() => {
    if (!mapRef.current || !centro) return;
    mapRef.current.setView([centro.lat, centro.lng], 14);
  }, [centro]);

  // Atualizar markers e rota
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    const criarIcone = (cor: string) =>
      L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${cor};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

    if (origem) {
      L.marker([origem.coordenada.lat, origem.coordenada.lng], { icon: criarIcone("#1db865") })
        .addTo(markersRef.current);
    }

    if (destino) {
      L.marker([destino.coordenada.lat, destino.coordenada.lng], { icon: criarIcone("#666") })
        .addTo(markersRef.current);
    }

    if (rota && rota.pontos.length > 0) {
      const latlngs: L.LatLngExpression[] = rota.pontos.map((p) => [p.lat, p.lng]);
      routeRef.current = L.polyline(latlngs, {
        color: "#1db865",
        weight: 4,
        opacity: 0.9,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(routeRef.current.getBounds(), { padding: [60, 60] });
    }
  }, [origem, destino, rota]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0" />
  );
}
