import { BadgeCheck, ShieldCheck, MapPin, Sparkles, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  resolverNomeCategoria,
  ordenarCategoriasServico,
} from "../utils/resolver_nome_categoria";

interface Props {
  nome: string;
  bio: string | null;
  isVerified: boolean;
  credentialVerified: boolean;
  credentialType: string | null;
  credentialNumber: string | null;
  serviceCategories: string[];
  cidade?: string | null;
}

const ROTULOS_CREDENCIAL: Record<string, string> = {
  crm: "CRM",
  oab: "OAB",
  crea: "CREA",
  cro: "CRO",
  crn: "CRN",
  cref: "CREF",
  other: "Credencial",
};

export function SecaoSobreProfissional({
  nome,
  bio,
  isVerified,
  credentialVerified,
  credentialType,
  credentialNumber,
  serviceCategories,
  cidade,
}: Props) {
  const categoriasOrdenadas = ordenarCategoriasServico(serviceCategories);
  const temCredencial = credentialVerified && credentialType;
  const temAlgo =
    bio || isVerified || temCredencial || cidade || categoriasOrdenadas.length > 0;

  if (!temAlgo) return null;

  const rotuloCred = credentialType
    ? ROTULOS_CREDENCIAL[credentialType] ?? credentialType.toUpperCase()
    : null;

  return (
    <section className="max-w-3xl mx-auto px-4 mt-8">
      <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-elegant)] space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Sobre {nome.split(" ")[0]}
            </h2>
          </div>

          {bio && (
            <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          )}

          <div className="grid gap-3">
            {isVerified && (
              <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
                <BadgeCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-base font-semibold text-foreground">Perfil verificado</p>
                  <p className="text-sm text-muted-foreground">
                    Identidade confirmada pela plataforma.
                  </p>
                </div>
              </div>
            )}

            {temCredencial && (
              <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {rotuloCred} verificado
                    {credentialNumber ? ` · ${credentialNumber}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Credencial profissional validada.
                  </p>
                </div>
              </div>
            )}

            {cidade && (
              <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-base font-semibold text-foreground">Atende em {cidade}</p>
                </div>
              </div>
            )}
          </div>

          {categoriasOrdenadas.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Especialidades
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoriasOrdenadas.map((cat) => (
                  <Badge key={cat} variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold">
                    {resolverNomeCategoria(cat)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
