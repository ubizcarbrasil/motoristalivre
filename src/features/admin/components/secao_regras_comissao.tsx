import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Percent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHookRegrasComissao } from "../hooks/hook_regras_comissao";
import { DialogoEditorRegra } from "./dialogo_editor_regra";
import type { RegraComissaoComCategoria } from "../types/tipos_regras_comissao";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function SecaoRegrasComissao(_props?: { modo?: string }) {
  const { categorias, regras, carregando, salvando, criar, atualizar, remover } =
    useHookRegrasComissao();
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<RegraComissaoComCategoria | null>(null);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const categoriasJaConfiguradas = regras.map((r) => r.category_id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Regras de comissão por categoria
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure percentuais de cobertura e indicação por categoria de serviço.
          Quando não houver regra, o motor usa o percentual global da aba Comissões.
        </p>
      </header>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditando(null);
            setDialogoAberto(true);
          }}
          disabled={categorias.length === 0}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova regra
        </Button>
      </div>

      {regras.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
          <Tag className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhuma regra cadastrada. O motor usará o percentual global do tenant.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {regras.map((regra) => (
            <li
              key={regra.id}
              className="rounded-lg border border-border bg-card p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {regra.categoria?.nome ?? "Categoria removida"}
                    </p>
                    {!regra.ativo && (
                      <Badge variant="outline" className="text-[10px]">
                        inativa
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-muted-foreground">
                    <span>
                      Cobertura:{" "}
                      <strong className="text-foreground">
                        {regra.comissao_cobertura_pct}%
                      </strong>
                    </span>
                    <span>
                      Indicação:{" "}
                      <strong className="text-foreground">
                        {regra.comissao_indicacao_pct}%
                      </strong>
                    </span>
                    {regra.comissao_fixa_brl > 0 && (
                      <span>
                        Fixa:{" "}
                        <strong className="text-foreground">
                          {brl(regra.comissao_fixa_brl)}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={salvando}
                    onClick={() => {
                      setEditando(regra);
                      setDialogoAberto(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    disabled={salvando}
                    onClick={() => {
                      if (confirm(`Remover regra de ${regra.categoria?.nome}?`)) {
                        remover(regra.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DialogoEditorRegra
        aberto={dialogoAberto}
        onFechar={() => setDialogoAberto(false)}
        categorias={categorias}
        regraExistente={editando}
        categoriasJaConfiguradas={categoriasJaConfiguradas}
        salvando={salvando}
        onSalvar={async (payload) => {
          if (editando) {
            await atualizar(editando.id, payload);
          } else {
            await criar(payload);
          }
        }}
      />
    </div>
  );
}
