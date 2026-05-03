import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CardResultadoProfissional } from "./card_resultado_profissional";
import type { ProfissionalBusca } from "../types/tipos_convites";

interface Props {
  resultados: ProfissionalBusca[];
  carregando: boolean;
  onBuscar: (termo: string) => Promise<void>;
  onConvidar: (driverId: string) => Promise<void>;
}

export function BuscaProfissionalAdmin({ resultados, carregando, onBuscar, onConvidar }: Props) {
  const [termo, setTermo] = useState("");
  const [enviandoId, setEnviandoId] = useState<string | null>(null);

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    if (termo.trim().length < 2) {
      toast.error("Digite ao menos 2 caracteres");
      return;
    }
    await onBuscar(termo);
  }

  async function handleConvidar(driverId: string) {
    setEnviandoId(driverId);
    try {
      await onConvidar(driverId);
      toast.success("Convite enviado");
    } catch (err) {
      toast.error("Erro ao enviar convite");
      console.error(err);
    } finally {
      setEnviandoId(null);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleBuscar} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por @handle ou nome"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={carregando}>
          {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
      </form>

      {carregando && (
        <p className="text-xs text-muted-foreground text-center py-4">Buscando...</p>
      )}

      {!carregando && resultados.length === 0 && termo.trim().length >= 2 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Nenhum profissional encontrado
        </p>
      )}

      <div className="space-y-2">
        {resultados.map((p) => (
          <CardResultadoProfissional
            key={p.driver_id}
            profissional={p}
            onConvidar={handleConvidar}
            enviando={enviandoId === p.driver_id}
          />
        ))}
      </div>
    </div>
  );
}
