import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PerfilPublicoMotorista } from "../types/tipos_perfil_motorista";

interface Props {
  perfil: PerfilPublicoMotorista;
}

export function HeaderPerfil({ perfil }: Props) {
  const iniciais = perfil.nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3 pt-8 pb-4 px-6">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={perfil.avatar_url ?? undefined} alt={perfil.nome} />
          <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">
            {iniciais}
          </AvatarFallback>
        </Avatar>
        {perfil.is_verified && (
          <CheckCircle2 className="absolute bottom-0 right-0 h-6 w-6 text-primary fill-primary stroke-background" />
        )}
      </div>

      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
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
        <p className="text-sm text-muted-foreground">{perfil.tenant_nome}</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={perfil.is_online ? "default" : "secondary"}
          className={perfil.is_online ? "bg-primary text-primary-foreground" : ""}
        >
          {perfil.is_online ? "Online" : "Offline"}
        </Badge>
        {perfil.is_verified && (
          <Badge variant="outline" className="border-primary text-primary">
            Verificado
          </Badge>
        )}
      </div>
    </div>
  );
}
