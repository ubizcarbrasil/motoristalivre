import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Plano = Tables<"plans">;

export function PlanosLanding() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase
      .from("plans")
      .select("*")
      .order("price_monthly", { ascending: true })
      .then(({ data }) => {
        setPlanos(data ?? []);
        setCarregando(false);
      });
  }, []);

  if (carregando) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-8 animate-pulse h-80" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Comece pequeno e escale conforme seu grupo cresce.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {planos.map((plano, index) => {
            const destaque = index === 1;
            const features = Array.isArray(plano.features) ? plano.features as string[] : [];

            return (
              <div
                key={plano.id}
                className={`relative rounded-xl border p-8 flex flex-col transition-colors ${
                  destaque
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Mais popular
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-foreground">{plano.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      R${Number(plano.price_monthly).toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plano.max_drivers >= 9999
                      ? "Motoristas ilimitados"
                      : `Ate ${plano.max_drivers} motoristas`}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={destaque ? "default" : "outline"}
                  className="w-full h-11"
                >
                  <Link to="/cadastro">Comecar com {plano.name}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
