import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, ShieldCheck, Users, ChevronRight } from "lucide-react";
import type { MembroEquipe } from "../types/tipos_vitrine";

interface Props {
  membros: MembroEquipe[];
  tenantSlug: string;
}

export function SecaoEquipePublica({ membros, tenantSlug }: Props) {
  const navigate = useNavigate();
  if (!membros || membros.length === 0) return null;

  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Minha equipe</h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Outros profissionais que indico no mesmo grupo.
      </p>

      <div className="space-y-2">
        {membros.map((m) => {
          const iniciais = m.nome
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/${tenantSlug}/perfil/${m.slug}`)}
              className="w-full text-left rounded-xl bg-card border border-border p-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={m.avatar_url ?? undefined} alt={m.nome} />
                <AvatarFallback>{iniciais}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{m.nome}</p>
                  {m.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                  {m.credential_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </div>
                {m.headline && (
                  <p className="text-[11px] text-muted-foreground truncate">{m.headline}</p>
                )}
                {m.service_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.service_categories.slice(0, 3).map((c) => (
                      <Badge
                        key={c}
                        variant="outline"
                        className="border-primary/40 text-primary text-[10px] px-1.5 py-0 h-4"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
