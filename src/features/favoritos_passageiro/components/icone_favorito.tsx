import { Home, Briefcase, MapPin } from "lucide-react";
import type { TipoFavorito } from "../types/tipos_favoritos";

interface IconeFavoritoProps {
  type: TipoFavorito;
  className?: string;
}

export function IconeFavorito({ type, className = "w-4 h-4" }: IconeFavoritoProps) {
  if (type === "home") return <Home className={className} />;
  if (type === "work") return <Briefcase className={className} />;
  return <MapPin className={className} />;
}
