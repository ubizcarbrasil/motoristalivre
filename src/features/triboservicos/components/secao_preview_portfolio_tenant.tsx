import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import type { ItemPreviewPortfolioTenant } from "../services/servico_vitrine_publica";

interface Props {
  itens: ItemPreviewPortfolioTenant[];
  tenantSlug: string;
}

export function SecaoPreviewPortfolioTenant({ itens, tenantSlug }: Props) {
  if (itens.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 mt-10">
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Em breve trabalhos publicados pelos profissionais.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 mt-10 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Trabalhos em destaque
        </h2>
        <p className="text-sm text-muted-foreground">
          Veja amostras do que nossos profissionais entregam.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {itens.map((item) => (
          <Link
            key={item.id}
            to={`/s/${tenantSlug}/${item.driver_slug}`}
            className="relative aspect-square rounded-xl overflow-hidden bg-secondary group"
          >
            <img
              src={item.image_url}
              alt={item.caption ?? `Trabalho de ${item.driver_nome}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-medium text-foreground truncate">
                {item.driver_nome}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
