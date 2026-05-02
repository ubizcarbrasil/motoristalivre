import { useEffect, useState } from "react";
import { Users, ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MembroEquipe } from "@/features/motorista/types/tipos_vitrine";
import {
  listarEquipePublica,
  calcularStatusDisponibilidade,
  type StatusDisponibilidade,
} from "../services/servico_status_equipe";

interface Props {
  ownerDriverId: string;
  tenantSlug: string;
}

const ROTULOS_STATUS: Record<StatusDisponibilidade, { texto: string; cor: string; pulse: boolean }> = {
  disponivel: { texto: "Disponível hoje", cor: "bg-primary", pulse: true },
  ocupado: { texto: "Ocupado hoje", cor: "bg-amber-500", pulse: false },
  sem_agenda: { texto: "Sem agenda hoje", cor: "bg-muted-foreground", pulse: false },
};

export function SecaoEquipeServicos({ ownerDriverId, tenantSlug }: Props) {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, StatusDisponibilidade>>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const lista = await listarEquipePublica(ownerDriverId);
        if (cancelado) return;
        setMembros(lista);
        if (lista.length > 0) {
          const ids = lista.map((m) => m.member_driver_id);
          const statuses = await calcularStatusDisponibilidade(ids);
          if (!cancelado) setStatusMap(statuses);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [ownerDriverId]);

  if (carregando) {
    return (
      <section className="max-w-3xl mx-auto px-4 mt-8">
        <div className="rounded-xl border border-border p-6 flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (membros.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 mt-8 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Equipe e parceiros</h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Profissionais indicados — cada um com sua agenda e seus preços.
      </p>

      <div className="space-y-2">
        {membros.map((m) => {
          const status = statusMap[m.member_driver_id] ?? "sem_agenda";
          const rotulo = ROTULOS_STATUS[status];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/s/${tenantSlug}/${m.slug}`)}
              className="w-full text-left rounded-xl bg-card border border-border p-3 flex items-center gap-3 hover:border-primary/50 transition-colors"
            >
              <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden bg-secondary">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.nome} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                    {m.nome.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{m.nome}</p>
                  {m.credential_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {m.headline ?? `/${m.slug}`}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`relative flex h-2 w-2`}>
                    {rotulo.pulse && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${rotulo.cor} opacity-60`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${rotulo.cor}`} />
                  </span>
                  <span className="text-[11px] text-muted-foreground">{rotulo.texto}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
