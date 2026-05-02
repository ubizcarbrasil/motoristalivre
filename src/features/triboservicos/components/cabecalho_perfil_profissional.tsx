import { BadgeCheck, ShieldCheck, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  resolverNomeCategoria,
  ordenarCategoriasServico,
} from "../utils/resolver_nome_categoria";
import { imagemDeCapa } from "@/compartilhados/utils/imagens_categorias";

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

/**
 * Cabeçalho estilo "app de serviço" — cover hero (Unsplash provisório
 * baseado na categoria principal quando não houver cover própria),
 * avatar circular sobreposto e identidade compacta.
 */
export function CabecalhoPerfilProfissional({
  nome,
  avatarUrl,
  coverUrl,
  bio: _bio,
  isVerified,
  credentialVerified,
  credentialType,
  serviceCategories,
  cidade,
}: Props) {
  const coverFinal = coverUrl ?? imagemDeCapa(serviceCategories);
  const categoriasOrdenadas = ordenarCategoriasServico(serviceCategories);

  return (
    <header className="relative w-full">
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-secondary">
        <img
          src={coverFinal}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
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
            <h1 className="text-2xl font-semibold text-foreground leading-tight">
              {nome}
            </h1>
            {isVerified && (
              <BadgeCheck
                className="w-5 h-5 text-primary"
                aria-label="Perfil verificado"
              />
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

          {categoriasOrdenadas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoriasOrdenadas.slice(0, 5).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {resolverNomeCategoria(cat)}
                </Badge>
              ))}
              {categoriasOrdenadas.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{categoriasOrdenadas.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
