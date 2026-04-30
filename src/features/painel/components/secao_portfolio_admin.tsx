import { useEffect, useMemo, useState } from "react";
import { Images, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "@/features/motorista/types/tipos_vitrine";
import {
  listarPortfolioDoDriver,
  adicionarItemPortfolio,
  atualizarItemPortfolio,
  removerItemPortfolio,
  uploadImagemPortfolio,
  reordenarItensPortfolio,
} from "../services/servico_vitrine_admin";
import { CardItemPortfolio } from "./card_item_portfolio";
import { DialogoPortfolio, type ModoDialogoPortfolio } from "./dialogo_portfolio";
import { GradePortfolioArrastavel } from "./grade_portfolio_arrastavel";

interface Props {
  driverId: string;
  tenantId: string;
  servicos: TipoServico[];
}

export function SecaoPortfolioAdmin({ driverId, tenantId, servicos }: Props) {
  const [itens, setItens] = useState<ItemPortfolio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modoDialogo, setModoDialogo] = useState<ModoDialogoPortfolio | null>(null);
  const [itemRemover, setItemRemover] = useState<ItemPortfolio | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      setItens(await listarPortfolioDoDriver(driverId));
    } catch {
      toast.error("Erro ao carregar portfólio");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const mapaServicos = useMemo(
    () => new Map(servicos.map((s) => [s.id, s])),
    [servicos],
  );

  const gruposPorServico = useMemo(() => {
    const grupos = new Map<string, ItemPortfolio[]>();
    for (const it of itens) {
      const lista = grupos.get(it.service_type_id) ?? [];
      lista.push(it);
      grupos.set(it.service_type_id, lista);
    }
    return Array.from(grupos.entries())
      .map(([id, lista]) => ({
        id,
        servico: mapaServicos.get(id),
        itens: lista,
      }))
      .filter((g) => g.servico)
      .sort((a, b) => (a.servico!.name ?? "").localeCompare(b.servico!.name ?? ""));
  }, [itens, mapaServicos]);

  const salvarCriacao = async ({
    arquivo,
    service_type_id,
    caption,
  }: {
    arquivo: File;
    service_type_id: string;
    caption: string | null;
  }) => {
    setEnviando(true);
    try {
      const url = await uploadImagemPortfolio(driverId, arquivo);
      await adicionarItemPortfolio({
        driver_id: driverId,
        tenant_id: tenantId,
        service_type_id,
        image_url: url,
        caption,
        ordem: itens.filter((i) => i.service_type_id === service_type_id).length,
      });
      toast.success("Trabalho adicionado");
      setModoDialogo(null);
      await carregar();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar");
    } finally {
      setEnviando(false);
    }
  };

  const salvarEdicao = async ({
    id,
    service_type_id,
    caption,
  }: {
    id: string;
    service_type_id: string;
    caption: string | null;
  }) => {
    setEnviando(true);
    try {
      await atualizarItemPortfolio(id, { service_type_id, caption });
      toast.success("Trabalho atualizado");
      setItens((lista) =>
        lista.map((i) => (i.id === id ? { ...i, service_type_id, caption } : i)),
      );
      setModoDialogo(null);
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setEnviando(false);
    }
  };

  const confirmarRemocao = async () => {
    if (!itemRemover) return;
    setRemovendo(true);
    try {
      await removerItemPortfolio(itemRemover.id, itemRemover.image_url);
      setItens((lista) => lista.filter((i) => i.id !== itemRemover.id));
      toast.success("Removido");
    } catch {
      toast.error("Erro ao remover");
    } finally {
      setRemovendo(false);
      setItemRemover(null);
    }
  };

  const reordenarGrupo = async (
    serviceTypeId: string,
    novaOrdem: ItemPortfolio[],
  ) => {
    const anteriores = itens;
    const outros = itens.filter((i) => i.service_type_id !== serviceTypeId);
    setItens([...outros, ...novaOrdem]);

    try {
      await reordenarItensPortfolio(
        novaOrdem.map((it, idx) => ({ id: it.id, ordem: idx })),
      );
    } catch {
      setItens(anteriores);
      toast.error("Não foi possível salvar a nova ordem");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Portfólio</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setModoDialogo({ tipo: "criar" })}
          disabled={servicos.length === 0}
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </Button>
      </div>

      {servicos.length === 0 && (
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-[11px] text-muted-foreground">
            Cadastre ao menos um serviço para começar a montar seu portfólio.
          </p>
        </div>
      )}

      {servicos.length > 0 && (
        <>
          {carregando ? (
            <div className="rounded-xl bg-card border border-border p-6 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : itens.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Nenhum trabalho ainda. Mostre fotos dos serviços que você realiza.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {gruposPorServico.map((grupo) => (
                <div key={grupo.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {grupo.servico!.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {grupo.itens.length}{" "}
                        {grupo.itens.length === 1 ? "imagem" : "imagens"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setModoDialogo({ tipo: "criar", servicoIdInicial: grupo.id })
                      }
                      className="text-[10px] font-medium text-primary hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {grupo.itens.map((item) => (
                      <CardItemPortfolio
                        key={item.id}
                        item={item}
                        servico={grupo.servico}
                        onEditar={() => setModoDialogo({ tipo: "editar", item })}
                        onRemover={() => setItemRemover(item)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <DialogoPortfolio
        aberto={!!modoDialogo}
        modo={modoDialogo}
        servicos={servicos}
        enviando={enviando}
        onFechar={() => !enviando && setModoDialogo(null)}
        onSalvarCriacao={salvarCriacao}
        onSalvarEdicao={salvarEdicao}
      />

      <AlertDialog
        open={!!itemRemover}
        onOpenChange={(o) => !o && !removendo && setItemRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover trabalho?</AlertDialogTitle>
            <AlertDialogDescription>
              A imagem será excluída do seu portfólio público. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removendo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmarRemocao();
              }}
              disabled={removendo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removendo ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
