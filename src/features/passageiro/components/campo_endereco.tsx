import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Crosshair, Loader2 } from "lucide-react";
import { useAutocompletarEndereco } from "../hooks/hook_autocompletar_endereco";
import type { EnderecoCompleto, Coordenada } from "../types/tipos_passageiro";

interface CampoEnderecoProps {
  tipo: "origem" | "destino";
  valor: EnderecoCompleto | null;
  onSelecionar: (endereco: EnderecoCompleto) => void;
  placeholder: string;
  onGeolocalizarOrigem?: () => void;
}

export function CampoEndereco({ tipo, valor, onSelecionar, placeholder, onGeolocalizarOrigem }: CampoEnderecoProps) {
  const { consulta, setConsulta, resultados, carregando } = useAutocompletarEndereco();
  const [focado, setFocado] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const textoExibido = valor?.endereco ?? "";

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocado(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center shrink-0 w-4">
          <div className={`w-2.5 h-2.5 rounded-full ${tipo === "origem" ? "bg-primary" : "bg-muted-foreground"}`} />
        </div>
        <div className="flex-1 relative">
          <Input
            placeholder={placeholder}
            value={focado ? consulta : textoExibido}
            onChange={(e) => setConsulta(e.target.value)}
            onFocus={() => {
              setFocado(true);
              setConsulta(textoExibido);
            }}
            className="bg-secondary border-0 h-11 text-sm pr-10"
          />
          {tipo === "origem" && onGeolocalizarOrigem && (
            <button
              type="button"
              onClick={onGeolocalizarOrigem}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Usar minha localização"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {focado && (consulta.length >= 3 || resultados.length > 0) && (
        <div className="absolute left-7 right-0 top-full mt-1 bg-card border border-border rounded-lg overflow-hidden z-50 shadow-xl max-h-52 overflow-y-auto">
          {carregando && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!carregando && resultados.length === 0 && consulta.length >= 3 && (
            <p className="text-xs text-muted-foreground px-3 py-3">Nenhum resultado encontrado</p>
          )}
          {resultados.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelecionar({
                  coordenada: { lat: r.lat, lng: r.lng },
                  endereco: r.endereco,
                });
                setFocado(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border last:border-0"
            >
              <span className="line-clamp-2">{r.endereco}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
