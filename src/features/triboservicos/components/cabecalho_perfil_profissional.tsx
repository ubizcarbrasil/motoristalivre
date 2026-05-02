import { BadgeCheck, ShieldCheck, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  resolverNomeCategoria,
  ordenarCategoriasServico,
} from "../utils/resolver_nome_categoria";

interface Props {
  nome: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  credentialVerified: boolean;
  credentialType: string | null;
  serviceCategories: string[];
  cidade?: string | null;
}

export function CabecalhoPerfilProfissional({
  nome,
  avatarUrl,
  coverUrl,
  bio,
  isVerified,
  credentialVerified,
  credentialType,
  serviceCategories,
  cidade,
}: Props) {
  return (
    <header className="relative w-full">
      <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-gradient-to-br from-primary/40 via-primary/15 to-background">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={nome}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-14 relative">
        <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {nome.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{nome}</h1>
            {isVerified && (
              <BadgeCheck className="w-5 h-5 text-primary" aria-label="Perfil verificado" />
            )}
            {credentialVerified && (
              <ShieldCheck
                className="w-5 h-5 text-primary"
                aria-label={`Credencial ${credentialType ?? ""} verificada`}
              />
            )}
          </div>

          {cidade && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{cidade}</span>
            </div>
          )}

          {serviceCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {serviceCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {resolverNomeCategoria(cat)}
                </Badge>
              ))}
            </div>
          )}

          {bio && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">{bio}</p>
          )}
        </div>
      </div>
    </header>
  );
}
