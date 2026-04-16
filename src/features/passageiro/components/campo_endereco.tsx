import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Crosshair, Loader2, Star } from "lucide-react";
import { useAutocompletarEndereco } from "../hooks/hook_autocompletar_endereco";
import { SugestaoFavorito } from "@/features/favoritos_passageiro/components/sugestao_favorito";
import { SugestaoRecente } from "@/features/favoritos_passageiro/components/sugestao_recente";
import type { FavoritoEndereco } from "@/features/favoritos_passageiro/types/tipos_favoritos";
import type { EnderecoRecente } from "@/features/favoritos_passageiro/types/tipos_recentes";
import type { EnderecoCompleto } from "../types/tipos_passageiro";

interface CampoEnderecoProps {
  tipo: "origem" | "destino";
  valor: EnderecoCompleto | null;
  onSelecionar: (endereco: EnderecoCompleto) => void;
  placeholder: string;
  onGeolocalizarOrigem?: () => void;
  favoritos?: FavoritoEndereco[];
  recentes?: EnderecoRecente[];
  onFavoritarResultado?: (endereco: { address: string; lat: number; lng: number }) => void;
  identificarFavorito?: (lat: number, lng: number, endereco: string) => FavoritoEndereco | undefined;
}

const PRECISAO_COORDENADA = 4;

function chaveCoord(lat: number, lng: number): string {
  return `${lat.toFixed(PRECISAO_COORDENADA)},${lng.toFixed(PRECISAO_COORDENADA)}`;
}

export function CampoEndereco({
  tipo,
  valor,
  onSelecionar,
  placeholder,
  onGeolocalizarOrigem,
  favoritos = [],
  recentes = [],
  onFavoritarResultado,
  identificarFavorito,
}: CampoEnderecoProps) {
  const { consulta, setConsulta, resultados, carregando } = useAutocompletarEndereco();
  const [focado, setFocado] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const textoExibido = valor?.endereco ?? "";
  const semConsulta = consulta.length < 3;

  // Recentes que NÃO estão entre os favoritos (dedupe por coordenada)
  const chavesFavoritas = new Set(favoritos.map((f) => chaveCoord(f.lat, f.lng)));
  const recentesFiltrados = recentes.filter((r) => !chavesFavoritas.has(chaveCoord(r.lat, r.lng)));

  const mostrarFavoritos = focado && semConsulta && favoritos.length > 0;
  const mostrarRecentes = focado && semConsulta && recentesFiltrados.length > 0;
  const mostrarResultados = focado && (consulta.length >= 3 || resultados.length > 0);
  const mostrarDropdown = mostrarFavoritos || mostrarRecentes || mostrarResultados;

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

      {mostrarDropdown && (
        <div className="absolute left-7 right-0 top-full mt-1 bg-card border border-border rounded-lg overflow-hidden z-50 shadow-xl max-h-72 overflow-y-auto">
          {mostrarFavoritos && (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">
                Favoritos
              </p>
              {favoritos.slice(0, 5).map((f) => (
                <SugestaoFavorito
                  key={f.id}
                  favorito={f}
                  onSelecionar={() => {
                    onSelecionar({
                      coordenada: { lat: f.lat, lng: f.lng },
                      endereco: f.address,
                    });
                    setFocado(false);
                  }}
                />
              ))}
            </>
          )}

          {mostrarRecentes && (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">
                Endereços recentes
              </p>
              {recentesFiltrados.slice(0, 5).map((r) => (
                <SugestaoRecente
                  key={`${r.lat}-${r.lng}-${r.ultimaUtilizacao}`}
                  recente={r}
                  onSelecionar={() => {
                    onSelecionar({
                      coordenada: { lat: r.lat, lng: r.lng },
                      endereco: r.address,
                    });
                    setFocado(false);
                  }}
                  onFavoritar={
                    onFavoritarResultado
                      ? () =>
                          onFavoritarResultado({
                            address: r.address,
                            lat: r.lat,
                            lng: r.lng,
                          })
                      : undefined
                  }
                />
              ))}
            </>
          )}

          {mostrarResultados && (
            <>
              {carregando && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!carregando && resultados.length === 0 && consulta.length >= 3 && (
                <p className="text-xs text-muted-foreground px-3 py-3">Nenhum resultado encontrado</p>
              )}
              {resultados.map((r, i) => {
                const jaFavoritado = identificarFavorito?.(r.lat, r.lng, r.endereco);
                return (
                  <div
                    key={i}
                    className="flex items-center border-b border-border last:border-0 hover:bg-secondary transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelecionar({
                          coordenada: { lat: r.lat, lng: r.lng },
                          endereco: r.endereco,
                        });
                        setFocado(false);
                      }}
                      className="flex-1 text-left px-3 py-2.5 text-sm text-foreground"
                    >
                      <span className="line-clamp-2">{r.endereco}</span>
                    </button>
                    {onFavoritarResultado && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onFavoritarResultado({
                            address: r.endereco,
                            lat: r.lat,
                            lng: r.lng,
                          });
                        }}
                        className="p-2.5 mr-1 text-muted-foreground hover:text-primary transition-colors"
                        title={jaFavoritado ? "Já favoritado" : "Favoritar este endereço"}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            jaFavoritado ? "fill-primary text-primary" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
