import { Badge } from "@/components/ui/badge";
import { LinhaLink } from "./linha_link";
import { construirLinksDaTribo } from "../utils/construtor_links";
import type { TriboDev } from "../types/tipos_dev_links";

interface CardTriboLinksProps {
  tribo: TriboDev;
}

export function CardTriboLinks({ tribo }: CardTriboLinksProps) {
  const links = construirLinksDaTribo(tribo);

  return (
    <article className="space-y-3 rounded-xl border border-border bg-card/30 p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{tribo.name}</h3>
          <p className="font-mono text-xs text-muted-foreground">/{tribo.slug}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {tribo.modulos.map((m) => (
            <Badge key={m} variant="secondary" className="text-[10px]">
              {m}
            </Badge>
          ))}
        </div>
      </header>
      <div className="space-y-2">
        {links.map((item) => (
          <LinhaLink key={item.url} item={item} />
        ))}
      </div>
    </article>
  );
}
