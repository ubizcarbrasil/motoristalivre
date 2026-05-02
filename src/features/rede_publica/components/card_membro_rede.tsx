import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  iconePorSlug,
  nomePorSlug,
} from "@/compartilhados/constants/constantes_categorias_servico";
import type { MembroRedePublica } from "../types/tipos_rede";
import type { StatusDisponibilidade } from "@/features/triboservicos/services/servico_status_equipe";

interface Props {
  membro: MembroRedePublica;
  tenantSlug: string;
}

const ROTULOS_STATUS: Record<
  StatusDisponibilidade,
  { texto: string; cor: string; pulse: boolean }
> = {
  disponivel: { texto: "Disponível hoje", cor: "bg-primary", pulse: true },
  ocupado: { texto: "Ocupado hoje", cor: "bg-amber-500", pulse: false },
  sem_agenda: { texto: "Sem agenda hoje", cor: "bg-muted-foreground", pulse: false },
};

export function CardMembroRede({ membro, tenantSlug }: Props) {
  const navigate = useNavigate();
  const rotulo = ROTULOS_STATUS[membro.status];
  const categoriasMostrar = membro.service_categories.slice(0, 3);
  const restante = membro.service_categories.length - categoriasMostrar.length;

  // Prefere @handle (URL curta) quando disponível
  const destino = membro.handle
    ? `/@${membro.handle}`
    : `/s/${tenantSlug}/${membro.slug}`;

  return (
    <button
      type="button"
      onClick={() => navigate(destino)}
      className="w-full text-left rounded-xl bg-card border border-border p-4 flex gap-3 hover:border-primary/50 transition-colors"
    >
      <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden bg-secondary">
        {membro.avatar_url ? (
          <img
            src={membro.avatar_url}
            alt={membro.nome}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-base text-muted-foreground">
            {membro.nome.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {membro.nome}
          </p>
          {membro.credential_verified && (
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </div>

        {membro.headline && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {membro.headline}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {rotulo.pulse && (
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${rotulo.cor} opacity-60`}
              />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${rotulo.cor}`}
            />
          </span>
          <span className="text-[11px] text-muted-foreground">{rotulo.texto}</span>
        </div>

        {categoriasMostrar.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {categoriasMostrar.map((slug) => {
              const Icone = iconePorSlug(slug);
              return (
                <Badge
                  key={slug}
                  variant="outline"
                  className="border-border text-[10px] gap-1 py-0.5 px-1.5"
                >
                  <Icone className="h-2.5 w-2.5" />
                  {nomePorSlug(slug)}
                </Badge>
              );
            })}
            {restante > 0 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{restante}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
