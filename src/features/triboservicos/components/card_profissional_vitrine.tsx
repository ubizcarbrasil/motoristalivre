import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, ShieldCheck, ChevronRight, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfissionalVitrine } from "../services/servico_vitrine_publica";

interface Props {
  profissional: ProfissionalVitrine;
}

export function CardProfissionalVitrine({ profissional }: Props) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  function abrirPerfil() {
    navigate(`/s/${slug}/${profissional.slug}`);
  }

  return (
    <Card
      onClick={abrirPerfil}
      className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/40 transition-colors border-border/60"
    >
      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
        <AvatarImage src={profissional.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {profissional.nome.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-foreground truncate">{profissional.nome}</p>
          {profissional.is_verified && (
            <BadgeCheck className="w-4 h-4 text-primary shrink-0" aria-label="Verificado" />
          )}
          {profissional.credential_verified && (
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-label="Credencial verificada" />
          )}
        </div>

        {profissional.bio && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {profissional.bio}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {profissional.total_servicos}{" "}
            {profissional.total_servicos === 1 ? "serviço" : "serviços"}
          </Badge>
          {profissional.preco_minimo !== null && (
            <span className="text-xs text-foreground/80 font-medium">
              a partir de{" "}
              {profissional.preco_minimo.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </Card>
  );
}
