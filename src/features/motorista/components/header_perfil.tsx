import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PerfilPublicoMotorista } from "../types/tipos_perfil_motorista";
import { ChipsCategorias } from "./chips_categorias";
import { imagemDeCapa } from "@/compartilhados/utils/imagens_categorias";

interface Props {
  perfil: PerfilPublicoMotorista;
}

/**
 * Header em estilo de app de serviço:
 *  - Cover image (Unsplash provisório baseado na categoria principal).
 *  - Avatar circular sobreposto, parcialmente sobre a cover.
 *  - Badges de verificação e status online.
 *  - Chips das categorias logo abaixo.
 */
export function HeaderPerfil({ perfil }: Props) {
  const iniciais = perfil.nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const coverUrl = perfil.cover_url ?? imagemDeCapa(perfil.service_categories);

  return (
    <div className="relative">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={coverUrl}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

        {perfil.is_online && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-md px-2.5 py-1 border border-border">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-semibold text-foreground">Online</span>
          </div>
        )}
      </div>

      {/* Avatar + identidade */}
      <div className="flex flex-col items-center -mt-12 px-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={perfil.avatar_url ?? undefined} alt={perfil.nome} />
            <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">
              {iniciais}
            </AvatarFallback>
          </Avatar>
          {perfil.is_verified && (
            <CheckCircle2 className="absolute bottom-0 right-0 h-6 w-6 text-primary fill-primary stroke-background" />
          )}
        </div>

        <div className="mt-3 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">{perfil.nome}</h1>
            {perfil.credential_verified && perfil.credential_type && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-primary text-primary-foreground gap-1 px-2 py-0.5 cursor-help">
                      <ShieldCheck className="w-3 h-3" />
                      Verificado
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">
                      {perfil.credential_type.toUpperCase()}
                      {perfil.credential_number ? ` ${perfil.credential_number}` : ""}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{perfil.tenant_nome}</span>
          </div>
        </div>

        <div className="mt-3 w-full">
          <ChipsCategorias categorias={perfil.service_categories} />
        </div>
      </div>
    </div>
  );
}
