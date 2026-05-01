import { useEffect, useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listarCategorias } from "@/compartilhados/constants/constantes_categorias_servico";

interface SeletorCategoriasServicoProps {
  aberto: boolean;
  onFechar: () => void;
  selecionadas: string[];
  onConfirmar: (slugs: string[]) => void;
  limite?: number;
}

export function SeletorCategoriasServico({
  aberto,
  onFechar,
  selecionadas,
  onConfirmar,
  limite = 10,
}: SeletorCategoriasServicoProps) {
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState<string[]>(selecionadas);

  // Sincroniza estado interno com a seleção atual sempre que o modal abre
  useEffect(() => {
    if (aberto) {
      setEstado(selecionadas);
      setBusca("");
    }
  }, [aberto, selecionadas]);

  const categorias = listarCategorias();
  const termo = busca.trim().toLowerCase();

  const visiveis = categorias
    .map((cat) => ({
      ...cat,
      subcategorias: cat.subcategorias.filter((s) =>
        !termo
          ? true
          : s.nome.toLowerCase().includes(termo) ||
            cat.nome.toLowerCase().includes(termo) ||
            (s.grupo?.toLowerCase().includes(termo) ?? false),
      ),
    }))
    .filter((c) => c.subcategorias.length > 0);

  const tem = (id: string) => estado.includes(id);

  const alternar = (id: string) => {
    setEstado((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= limite) return prev;
      return [...prev, id];
    });
  };

  const confirmar = () => {
    onConfirmar(estado);
    onFechar();
  };

  return (
    <Sheet open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent
        side="bottom"
        className="h-[92vh] p-0 flex flex-col bg-background border-border"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <SheetTitle className="text-left text-base">
            Categorias de serviço
          </SheetTitle>
          <p className="text-[11px] text-muted-foreground text-left">
            {estado.length}/{limite} selecionadas. Toque para marcar.
          </p>
          <div className="relative pt-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
          {visiveis.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum serviço encontrado.
            </p>
          )}

          {visiveis.map((cat) => {
            const IconeCat = cat.icone;
            return (
              <section key={cat.id} className="space-y-2">
                <header className="flex items-center gap-2">
                  <IconeCat className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat.nome}
                  </h3>
                </header>

                <div className="grid grid-cols-2 gap-2">
                  {cat.subcategorias.map((sub) => {
                    const IconeSub = sub.icone;
                    const ativo = tem(sub.id);
                    const desabilitado = !ativo && estado.length >= limite;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => alternar(sub.id)}
                        disabled={desabilitado}
                        aria-pressed={ativo}
                        aria-label={`${sub.nome} – ${cat.nome}`}
                        className={`relative text-left rounded-xl border px-3 py-2.5 flex items-center gap-2.5 transition-colors ${
                          ativo
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/30"
                        } ${desabilitado ? "opacity-40" : ""}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            ativo ? "bg-primary/20" : "bg-secondary"
                          }`}
                        >
                          <IconeSub
                            className={`w-4 h-4 ${ativo ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-medium truncate ${
                              ativo ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {sub.nome}
                          </p>
                          {sub.grupo && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {sub.grupo}
                            </p>
                          )}
                        </div>
                        {ativo && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div
          className="border-t border-border px-4 py-3 flex gap-2"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onFechar}
            className="flex-1 h-11"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button type="button" onClick={confirmar} className="flex-1 h-11">
            Confirmar ({estado.length})
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
