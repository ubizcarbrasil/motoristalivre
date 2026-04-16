import { Badge } from "@/components/ui/badge";
import type { AfiliadoPerfil } from "../types/tipos_afiliado";

interface HeroAfiliadoProps {
  perfil: AfiliadoPerfil;
}

export function HeroAfiliado({ perfil }: HeroAfiliadoProps) {
  return (
    <div className="space-y-2 px-5 pt-8 pb-4">
      <h1 className="text-xl font-bold text-foreground">
        {perfil.nomeEstabelecimento || perfil.slug}
      </h1>
      {perfil.tipo && (
        <p className="text-sm text-muted-foreground">{perfil.tipo}</p>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Grupo: {perfil.tenantNome}</span>
        <Badge variant={perfil.aprovado ? "default" : "secondary"} className="text-xs">
          {perfil.aprovado ? "Aprovado" : "Pendente"}
        </Badge>
      </div>
    </div>
  );
}
