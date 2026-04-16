import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { buscarHistoricoSaques } from "../services/servico_saque";
import type { DonoCarteira, HistoricoSaque } from "../types/tipos_saque";
import { STATUS_SAQUE_LABELS } from "../types/tipos_saque";

interface HistoricoSaquesProps {
  userId: string;
  ownerType: DonoCarteira;
  recarregar?: number;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ItemSaque({ saque }: { saque: HistoricoSaque }) {
  const status = STATUS_SAQUE_LABELS[saque.status];
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          R$ {saque.amount.toFixed(2).replace(".", ",")}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Solicitado em {formatarData(saque.requested_at)}
        </p>
        {saque.processed_at && (
          <p className="text-[11px] text-muted-foreground">
            Processado em {formatarData(saque.processed_at)}
          </p>
        )}
        {saque.pix_key && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            PIX: {saque.pix_key}
          </p>
        )}
      </div>
      <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${status.cor}`}>
        {status.label}
      </span>
    </div>
  );
}

export function HistoricoSaques({ userId, ownerType, recarregar = 0 }: HistoricoSaquesProps) {
  const [saques, setSaques] = useState<HistoricoSaque[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    buscarHistoricoSaques(ownerType, userId)
      .then(setSaques)
      .catch(() => setSaques([]))
      .finally(() => setCarregando(false));
  }, [userId, ownerType, recarregar]);

  if (carregando) {
    return (
      <div className="py-6 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (saques.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-6 text-center">
        Nenhum saque solicitado ainda
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border px-3">
      {saques.map((s) => (
        <ItemSaque key={s.id} saque={s} />
      ))}
    </div>
  );
}
