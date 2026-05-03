import { Skeleton } from "@/components/ui/skeleton";
import { CardTriboPublica } from "./card_tribo_publica";
import { EstadoVazioTribos } from "./estado_vazio_tribos";
import type { TriboPublicaListada } from "../types/tipos_descoberta_tribos";

interface Props {
  tribos: TriboPublicaListada[];
  carregando: boolean;
}

export function GridTribos({ tribos, carregando }: Props) {
  if (carregando) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  if (tribos.length === 0) return <EstadoVazioTribos />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {tribos.map((t) => (
        <CardTriboPublica key={t.id} tribo={t} />
      ))}
    </div>
  );
}
