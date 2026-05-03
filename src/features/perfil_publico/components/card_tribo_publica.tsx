import { Crown, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { TriboDoProfissional } from "../services/servico_perfil_publico";

interface CardTriboPublicaProps {
  tribo: TriboDoProfissional;
  driverSlug: string;
}

export function CardTriboPublica({ tribo, driverSlug }: CardTriboPublicaProps) {
  const ehDono = tribo.papel === "owner";
  const linkPerfilNaTribo = `/s/${tribo.tenantSlug}/${driverSlug}`;

  return (
    <Link
      to={linkPerfilNaTribo}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
          {ehDono ? (
            <Crown className="h-5 w-5 text-primary" />
          ) : (
            <Users className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground truncate">{tribo.tenantName}</span>
            <span
              className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                ehDono ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {ehDono ? "Dono" : "Membro"}
            </span>
          </div>
          {tribo.categoryName && (
            <p className="text-xs text-muted-foreground mt-0.5">{tribo.categoryName}</p>
          )}
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Ver perfil e agenda nesta tribo
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
      </div>
    </Link>
  );
}
