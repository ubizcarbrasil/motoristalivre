import { listarCategorias } from "../constants/constantes_categorias_servico";

/**
 * Galeria de referência: lista todas categorias e subcategorias com seus ícones.
 * Útil para QA visual do design system de serviços.
 */
export function GaleriaCategorias() {
  const categorias = listarCategorias();

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {categorias.map((cat) => {
        const IconeCat = cat.icone;
        return (
          <section key={cat.id} className="space-y-3">
            <header className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconeCat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{cat.nome}</h2>
                <p className="text-[11px] text-muted-foreground">
                  {cat.subcategorias.length} subcategorias
                </p>
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {cat.subcategorias.map((sub) => {
                const IconeSub = sub.icone;
                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <IconeSub className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {sub.nome}
                      </p>
                      {sub.grupo && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {sub.grupo}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
