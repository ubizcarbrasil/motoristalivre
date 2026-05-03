import { Link } from "react-router-dom";
import { MapPin, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TriboPublicaListada } from "../types/tipos_descoberta_tribos";

interface Props {
  tribo: TriboPublicaListada;
}

export function CardTriboPublica({ tribo }: Props) {
  const linkVitrine = tribo.activeModules.includes("services")
    ? `/s/${tribo.slug}`
    : `/${tribo.slug}`;

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg">
      <div className="relative aspect-[16/9] w-full bg-muted">
        {tribo.coverUrl ? (
          <img
            src={tribo.coverUrl}
            alt={`Capa da tribo ${tribo.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        {tribo.logoUrl && (
          <div className="absolute -bottom-6 left-4 h-12 w-12 rounded-full border-2 border-card bg-card overflow-hidden">
            <img src={tribo.logoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex-1 p-4 pt-7 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-1">{tribo.name}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {tribo.categoryName && (
              <Badge variant="secondary" className="font-normal">
                {tribo.categoryName}
              </Badge>
            )}
            {tribo.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {tribo.city}
              </span>
            )}
          </div>
        </div>

        {tribo.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{tribo.description}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={linkVitrine}>
              Ver tribo
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          {tribo.signupSlug && (
            <Button asChild size="sm" className="flex-1">
              <Link to={`/s/cadastro/tribo/${tribo.signupSlug}`}>
                <UserPlus className="mr-1 h-3 w-3" />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
