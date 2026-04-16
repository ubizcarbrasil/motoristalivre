import { useEffect, useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  buscarGruposPorHandle,
  solicitarEntradaGrupo,
} from "../services/servico_configuracoes";
import { toast } from "sonner";
import type { ResultadoBuscaGrupo } from "../types/tipos_configuracoes";

interface BuscaGrupoProps {
  driverId: string;
  onSolicitado?: () => void;
}

export function BuscaGrupo({ driverId, onSolicitado }: BuscaGrupoProps) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoBuscaGrupo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [solicitandoId, setSolicitandoId] = useState<string | null>(null);

  // Debounce 500ms
  const termoDebounced = useDebounce(termo, 500);

  useEffect(() => {
    if (termoDebounced.replace(/^@/, "").trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    buscarGruposPorHandle(termoDebounced, driverId)
      .then(setResultados)
      .finally(() => setBuscando(false));
  }, [termoDebounced, driverId]);

  const solicitar = async (tenantId: string) => {
    setSolicitandoId(tenantId);
    try {
      await solicitarEntradaGrupo(driverId, tenantId);
      toast.success("Solicitação enviada");
      setResultados((rs) =>
        rs.map((r) => (r.id === tenantId ? { ...r, tem_solicitacao_pendente: true } : r)),
      );
      onSolicitado?.();
    } catch {
      toast.error("Erro ao solicitar entrada");
    } finally {
      setSolicitandoId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="@handle do grupo"
          className="pl-9 font-mono text-sm"
        />
      </div>

      {buscando && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!buscando && resultados.length === 0 && termoDebounced.length >= 2 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum grupo encontrado
        </p>
      )}

      <div className="space-y-2">
        {resultados.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-card border border-border p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">@{r.slug}</p>
            </div>
            {r.ja_e_membro ? (
              <span className="text-[10px] text-primary font-medium px-2 py-1">
                Você já é membro
              </span>
            ) : r.tem_solicitacao_pendente ? (
              <span className="text-[10px] text-muted-foreground px-2 py-1">
                Solicitação pendente
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={solicitandoId === r.id}
                onClick={() => solicitar(r.id)}
              >
                {solicitandoId === r.id ? "..." : "Solicitar"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return useMemo(() => debounced, [debounced]);
}
