import type { DadosPerfilPassageiro } from "../types/tipos_perfil_passageiro";

interface CabecalhoPerfilPassageiroProps {
  perfil: DadosPerfilPassageiro;
}

export function CabecalhoPerfilPassageiro({ perfil }: CabecalhoPerfilPassageiroProps) {
  const inicial = (perfil.full_name?.trim().charAt(0) || perfil.email?.charAt(0) || "?").toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
        {perfil.avatar_url ? (
          <img src={perfil.avatar_url} alt={perfil.full_name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-semibold text-foreground">{inicial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-foreground truncate">
          {perfil.full_name ?? "Passageiro"}
        </p>
        {perfil.email && (
          <p className="text-xs text-muted-foreground truncate">{perfil.email}</p>
        )}
        {perfil.phone && (
          <p className="text-xs text-muted-foreground truncate">{perfil.phone}</p>
        )}
      </div>
    </div>
  );
}
