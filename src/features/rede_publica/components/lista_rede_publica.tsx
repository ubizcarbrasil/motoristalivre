import { Users } from "lucide-react";
import type { MembroRedePublica } from "../types/tipos_rede";
import { CardMembroRede } from "./card_membro_rede";

interface Props {
  membros: MembroRedePublica[];
  tenantSlug: string;
}

export function ListaRedePublica({ membros, tenantSlug }: Props) {
  if (membros.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
        <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum profissional encontrado com esses filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {membros.map((m) => (
        <CardMembroRede key={m.id} membro={m} tenantSlug={tenantSlug} />
      ))}
    </div>
  );
}
