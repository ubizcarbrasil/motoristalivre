import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDescobertaTribos } from "../hooks/hook_descoberta_tribos";
import { CardTriboPublica } from "./card_tribo_publica";
import { Skeleton } from "@/components/ui/skeleton";

export function SecaoDescobertaHome() {
  const { tribos, carregando } = useDescobertaTribos({ limite: 6 });

  if (!carregando && tribos.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-card/30">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Encontre sua tribo
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Conheça tribos ativas na plataforma e ingresse na que combina com você.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/tribos">
              Ver todas as tribos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {carregando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tribos.slice(0, 6).map((t) => (
              <CardTriboPublica key={t.id} tribo={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
