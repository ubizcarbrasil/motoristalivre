import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buscarEnderecosNominatim } from "@/features/passageiro/services/servico_passageiro";

interface ResultadoBusca {
  endereco: string;
  lat: number;
  lng: number;
}

interface BuscadorEnderecoSimplesProps {
  valorInicial?: string;
  onSelecionar: (resultado: ResultadoBusca) => void;
  placeholder?: string;
}

export function BuscadorEnderecoSimples({
  valorInicial = "",
  onSelecionar,
  placeholder = "Buscar endereço",
}: BuscadorEnderecoSimplesProps) {
  const [consulta, setConsulta] = useState(valorInicial);
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (consulta.length < 3) {
      setResultados([]);
      return;
    }
    setCarregando(true);
    timeoutRef.current = setTimeout(async () => {
      const r = await buscarEnderecosNominatim(consulta);
      setResultados(r);
      setCarregando(false);
    }, 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [consulta]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          className="pl-9 h-10 text-sm"
        />
      </div>

      {aberto && (consulta.length >= 3 || resultados.length > 0) && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg overflow-hidden z-50 shadow-xl max-h-56 overflow-y-auto">
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
                onSelecionar(r);
                setConsulta(r.endereco);
                setAberto(false);
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
