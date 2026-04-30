import { Sparkles, Car, Share2 } from "lucide-react";

interface Props {
  tenantSlug: string;
  driverSlug: string;
  professionalType: "driver" | "service_provider" | "both";
}

interface ItemGuia {
  icone: typeof Sparkles;
  publico: string;
  exemploRota: string;
  cor: string;
}

/**
 * Bloco de orientação rápida no topo de "Meus Links" mostrando qual link
 * usar para cada público, evitando que o usuário envie a URL errada.
 */
export function GuiaLinksRapido({ tenantSlug, driverSlug, professionalType }: Props) {
  const ofereceServicos =
    professionalType === "service_provider" || professionalType === "both";
  const ofereceCorridas = professionalType === "driver" || professionalType === "both";

  const itens: ItemGuia[] = [];

  if (ofereceServicos) {
    itens.push({
      icone: Sparkles,
      publico: "Cliente quer agendar serviço",
      exemploRota: `/s/${tenantSlug}/${driverSlug}`,
      cor: "text-amber-400",
    });
  }
  if (ofereceCorridas) {
    itens.push({
      icone: Car,
      publico: "Passageiro quer pedir corrida",
      exemploRota: `/${tenantSlug}/${driverSlug}`,
      cor: "text-purple-400",
    });
  }
  itens.push({
    icone: Share2,
    publico: "Indicar e ganhar comissão",
    exemploRota: `/${tenantSlug}/a/${driverSlug}`,
    cor: "text-blue-400",
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground">Guia rápido — qual link enviar?</p>
      <div className="space-y-2">
        {itens.map((item) => {
          const Icone = item.icone;
          return (
            <div key={item.exemploRota} className="flex items-start gap-2">
              <Icone className={`w-4 h-4 mt-0.5 shrink-0 ${item.cor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground">{item.publico}</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">
                  {item.exemploRota}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
