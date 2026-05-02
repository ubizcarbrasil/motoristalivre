import { BadgeCheck, ShieldCheck, MapPin, Star } from "lucide-react";

interface IdentidadePerfilProps {
  nome: string;
  tenantNome?: string | null;
  cidade?: string | null;
  isVerified: boolean;
  credentialVerified: boolean;
  credentialType?: string | null;
  notaMedia?: number;
  totalAvaliacoes?: number;
}

/**
 * Bloco de identidade logo abaixo do avatar:
 * - Nome XL com selo verificado verde inline
 * - Linha secundária com tribo + cidade
 * - Rating destacado (estrela cheia + nota + total) quando houver avaliações
 */
export function IdentidadePerfil({
  nome,
  tenantNome,
  cidade,
  isVerified,
  credentialVerified,
  credentialType,
  notaMedia = 0,
  totalAvaliacoes = 0,
}: IdentidadePerfilProps) {
  const temRating = totalAvaliacoes > 0 && notaMedia > 0;

  return (
    <section className="max-w-3xl mx-auto px-5 mt-3 space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight">
          {nome}
        </h1>
        {isVerified && (
          <BadgeCheck
            className="w-6 h-6 text-primary shrink-0"
            aria-label="Perfil verificado"
          />
        )}
        {credentialVerified && (
          <ShieldCheck
            className="w-5 h-5 text-primary shrink-0"
            aria-label={`Credencial ${credentialType ?? ""} verificada`}
          />
        )}
      </div>

      {/* Linha de metadados */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
        {temRating && (
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Star className="w-4 h-4 fill-primary text-primary" />
            {notaMedia.toFixed(1)}
            <span className="font-normal text-muted-foreground">
              ({totalAvaliacoes})
            </span>
          </span>
        )}
        {temRating && (tenantNome || cidade) && (
          <span className="text-border">·</span>
        )}
        {cidade && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {cidade}
          </span>
        )}
        {tenantNome && !cidade && <span>{tenantNome}</span>}
      </div>
    </section>
  );
}
