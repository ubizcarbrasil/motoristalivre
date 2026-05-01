import { LinhaLink } from "./linha_link";
import { LINKS_GLOBAIS } from "../utils/construtor_links";

export function SecaoLinksGlobais() {
  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-foreground">Links globais</h2>
        <p className="text-xs text-muted-foreground">
          Páginas públicas que não dependem de uma tribo específica.
        </p>
      </header>
      <div className="space-y-2">
        {LINKS_GLOBAIS.map((item) => (
          <LinhaLink key={item.url} item={item} />
        ))}
      </div>
    </section>
  );
}
