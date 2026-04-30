import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Images, LayoutGrid } from "lucide-react";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "../types/tipos_vitrine";

interface Props {
  servicos: TipoServico[];
  portfolio: ItemPortfolio[];
  categoriasFiltradas?: string[];
}

const CHAVE_TODAS = "__todas__";

export function SecaoCategoriasPortfolio({ servicos, portfolio, categoriasFiltradas }: Props) {
  const [filtro, setFiltro] = useState<string>(CHAVE_TODAS);
  const [aberto, setAberto] = useState<ItemPortfolio | null>(null);

  const mapaServicos = useMemo(
    () => new Map(servicos.map((s) => [s.id, s])),
    [servicos],
  );

  // Aplica filtro externo (categorias do header) primeiro
  const portfolioBase = useMemo(() => {
    if (!categoriasFiltradas || categoriasFiltradas.length === 0) return portfolio;
    const nomesPermitidos = new Set(categoriasFiltradas);
    return portfolio.filter((p) => {
      const servico = mapaServicos.get(p.service_type_id);
      return servico ? nomesPermitidos.has(servico.name) : false;
    });
  }, [portfolio, categoriasFiltradas, mapaServicos]);

  const categorias = useMemo(() => {
    const idsComItens = new Set(portfolioBase.map((p) => p.service_type_id));
    return servicos.filter((s) => idsComItens.has(s.id));
  }, [servicos, portfolioBase]);

  const itensFiltrados = useMemo(() => {
    if (filtro === CHAVE_TODAS) return portfolioBase;
    return portfolioBase.filter((p) => p.service_type_id === filtro);
  }, [portfolioBase, filtro]);

  if (portfolioBase.length === 0) return null;

  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center gap-2">
        <Images className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Categorias e portfólio</h2>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {portfolio.length} {portfolio.length === 1 ? "trabalho" : "trabalhos"}
        </span>
      </div>

      {categorias.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 snap-x">
          <ChipFiltro
            ativo={filtro === CHAVE_TODAS}
            onClick={() => setFiltro(CHAVE_TODAS)}
            icone={<LayoutGrid className="w-3 h-3" />}
            label="Todos"
            quantidade={portfolio.length}
          />
          {categorias.map((s) => {
            const qtd = portfolio.filter((p) => p.service_type_id === s.id).length;
            return (
              <ChipFiltro
                key={s.id}
                ativo={filtro === s.id}
                onClick={() => setFiltro(s.id)}
                label={s.name}
                quantidade={qtd}
              />
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {itensFiltrados.map((item) => {
          const servico = mapaServicos.get(item.service_type_id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setAberto(item)}
              className="relative aspect-square rounded-lg overflow-hidden border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={item.image_url}
                alt={item.caption ?? servico?.name ?? "Trabalho"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {servico && (
                <span className="absolute bottom-1 left-1 right-1 truncate rounded-sm bg-background/70 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-foreground text-left">
                  {servico.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-background border-border">
          {aberto && (
            <div className="flex flex-col">
              <img
                src={aberto.image_url}
                alt={aberto.caption ?? "Trabalho"}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-3 space-y-1">
                {mapaServicos.get(aberto.service_type_id) && (
                  <p className="text-[11px] font-medium text-primary">
                    {mapaServicos.get(aberto.service_type_id)?.name}
                  </p>
                )}
                {aberto.caption && (
                  <p className="text-xs text-muted-foreground">{aberto.caption}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ChipFiltroProps {
  ativo: boolean;
  onClick: () => void;
  label: string;
  quantidade: number;
  icone?: React.ReactNode;
}

function ChipFiltro({ ativo, onClick, label, quantidade, icone }: ChipFiltroProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
        ativo
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:border-primary/40"
      }`}
    >
      {icone}
      <span className="truncate max-w-[140px]">{label}</span>
      <span
        className={`rounded-full px-1.5 py-0 text-[10px] ${
          ativo ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
        }`}
      >
        {quantidade}
      </span>
    </button>
  );
}
