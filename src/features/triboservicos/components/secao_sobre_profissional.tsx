import { BadgeCheck, ShieldCheck, MapPin, Sparkles, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="border-border bg-card">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Sobre {nome.split(" ")[0]}
            </h2>
          </div>

          {bio && (
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {isVerified && (
              <div className="flex items-start gap-2 text-sm">
                <BadgeCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Perfil verificado</p>
                  <p className="text-xs text-muted-foreground">
                    Identidade confirmada pela plataforma.
                  </p>
                </div>
              </div>
            )}

            {temCredencial && (
              <div className="flex items-start gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {rotuloCred} verificado
                    {credentialNumber ? ` · ${credentialNumber}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Credencial profissional validada.
                  </p>
                </div>
              </div>
            )}

            {cidade && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Atende em {cidade}</p>
                </div>
              </div>
            )}
          </div>

          {categoriasOrdenadas.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  Especialidades
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoriasOrdenadas.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {resolverNomeCategoria(cat)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
