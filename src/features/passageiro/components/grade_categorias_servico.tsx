import { useNavigate } from "react-router-dom";
import {
  categoriasDestaque,
  listarCategorias,
  subcategoriasDestaque,
} from "@/compartilhados/constants/constantes_categorias_servico";

interface GradeCategoriasServicoProps {
  tenantSlug: string;
}

/**
 * Grade pública de descoberta de serviços para o cliente.
 * - Topo: "Mais procurados" (subcategorias com destaque).
 * - Abaixo: cards de todas as categorias-pai.
 * Tap em item navega para a vitrine pública filtrada por slug.
 */
export function GradeCategoriasServico({ tenantSlug }: GradeCategoriasServicoProps) {
  const navigate = useNavigate();
  const destaques = subcategoriasDestaque();
  const principais = categoriasDestaque();
  const todas = listarCategorias();

  const irPara = (slug: string) =>
    navigate(`/s/${tenantSlug}?cat=${encodeURIComponent(slug)}`);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Mais procurados
          </h2>
        </header>
        <div className="grid grid-cols-4 gap-2">
          {destaques.slice(0, 8).map(({ subcategoria }) => {
            const Icone = subcategoria.icone;
            return (
              <button
                key={subcategoria.id}
                type="button"
                onClick={() => irPara(subcategoria.id)}
                aria-label={subcategoria.nome}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-2.5 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">
                  {subcategoria.nome}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
        <div className="grid grid-cols-2 gap-2">
          {principais.map((cat) => {
            const Icone = cat.icone;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => irPara(cat.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icone className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {cat.nome}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {cat.subcategorias.length} serviços
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Explorar tudo</h2>
        <div className="flex flex-wrap gap-1.5">
          {todas.map((cat) => {
            const Icone = cat.icone;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => irPara(cat.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-foreground hover:border-primary/40 transition-colors"
              >
                <Icone className="w-3.5 h-3.5 text-primary" />
                {cat.nome}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
