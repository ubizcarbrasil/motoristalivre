import { useEffect, useState } from "react";
import { BadgeCheck, ShieldCheck, MapPin, Star, ImageIcon } from "lucide-react";
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
  const fallbackCover = imagemDeCapa(serviceCategories);
  const [coverInvalida, setCoverInvalida] = useState(false);
  const [avatarInvalido, setAvatarInvalido] = useState(false);
  const coverFinal = coverInvalida ? fallbackCover : coverUrl ?? fallbackCover;
  const categoriasOrdenadas = ordenarCategoriasServico(serviceCategories);
  const inicial = nome.trim().charAt(0).toUpperCase() || "P";

  useEffect(() => {
    setCoverInvalida(false);
  }, [coverUrl]);

  useEffect(() => {
    setAvatarInvalido(false);
  }, [avatarUrl]);

  return (
    <header className="relative w-full bg-background">
      <div className="relative h-[310px] w-full overflow-hidden bg-card sm:h-[360px]">
        <img
          src={coverFinal}
          alt={`Foto de capa de ${nome}`}
          className="absolute inset-0 h-full w-full object-cover"
          onLoad={(evento) => {
            const imagem = evento.currentTarget;
            if (coverUrl && imagem.naturalHeight > imagem.naturalWidth * 1.15) {
              setCoverInvalida(true);
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background via-background/90 to-transparent" />
        {(!coverUrl || coverInvalida) && (
          <div className="absolute bottom-5 right-4 flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur-md">
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
            Capa sugerida
          </div>
        )}
      </div>

      <div className="relative mx-auto -mt-28 max-w-3xl px-4 pb-2">
        <div className="space-y-4">
          <Avatar className="h-28 w-28 border-4 border-background ring-2 ring-primary shadow-2xl sm:h-32 sm:w-32">
            <AvatarImage
              src={!avatarInvalido ? avatarUrl ?? undefined : undefined}
              alt={`Foto de ${nome}`}
              className="object-cover"
              onLoadingStatusChange={(status) => {
                if (status !== "loaded") return;
                const img = document.querySelector(`img[alt="Foto de ${nome}"]`) as HTMLImageElement | null;
                if (img && img.naturalWidth > img.naturalHeight * 1.2) setAvatarInvalido(true);
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-secondary text-4xl font-bold text-foreground">
              {inicial}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-4xl font-bold leading-none tracking-normal text-foreground sm:text-5xl">
                  {nome}
                </h1>
                {isVerified && (
                  <BadgeCheck
                    className="h-7 w-7 text-primary"
                    aria-label="Perfil verificado"
                  />
                )}
                {credentialVerified && (
                  <ShieldCheck
                    className="h-7 w-7 text-primary"
                    aria-label={`Credencial ${credentialType ?? ""} verificada`}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  4.9
                </span>
                {cidade && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {cidade}
                  </span>
                )}
                <span>Profissional verificado</span>
              </div>
            </div>

            {categoriasOrdenadas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categoriasOrdenadas.slice(0, 5).map((cat) => (
                  <Badge key={cat} variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold">
                    {resolverNomeCategoria(cat)}
                  </Badge>
                ))}
                {categoriasOrdenadas.length > 5 && (
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold">
                    +{categoriasOrdenadas.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
