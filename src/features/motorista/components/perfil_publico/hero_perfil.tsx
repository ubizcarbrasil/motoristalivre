import { ArrowLeft, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeroPerfilProps {
  nome: string;
  avatarUrl: string | null;
  coverUrl: string;
  onVoltar: () => void;
  onCompartilhar: () => void;
}

/**
 * Hero estilo iFood/Rappi:
 * - Cover de 240px (mobile) / 320px (desktop) cobrindo toda a largura
 * - Gradiente sutil só na base, sem comer a foto
 * - Avatar grande sobreposto (96px / 128px) com ring accent
 * - Botões flutuantes de voltar e compartilhar com glassmorphism
 */
export function HeroPerfil({
  nome,
  avatarUrl,
  coverUrl,
  onVoltar,
  onCompartilhar,
}: HeroPerfilProps) {
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <header className="relative w-full">
      {/* Botões flutuantes */}
      <div className="absolute top-3 inset-x-0 z-30 flex items-center justify-between px-3">
        <button
          onClick={onVoltar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white shadow-lg active:scale-95 transition-transform"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onCompartilhar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white shadow-lg active:scale-95 transition-transform"
          aria-label="Compartilhar"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Cover */}
      <div className="relative h-60 sm:h-80 w-full overflow-hidden bg-secondary">
        <img
          src={coverUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Vinheta sutil só nas bordas, mantém a foto viva */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
      </div>

      {/* Avatar sobreposto */}
      <div className="max-w-3xl mx-auto px-5 -mt-14 sm:-mt-16 relative z-10">
        <Avatar className="w-28 h-28 sm:w-32 sm:h-32 ring-4 ring-background shadow-2xl">
          <AvatarImage src={avatarUrl ?? undefined} alt={nome} className="object-cover" />
          <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/40 text-primary-foreground">
            {inicial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
