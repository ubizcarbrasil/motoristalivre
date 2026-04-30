import { useEffect, useRef, useState } from "react";
import { Images, Plus, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "@/features/motorista/types/tipos_vitrine";
import {
  listarPortfolioDoDriver,
  adicionarItemPortfolio,
  removerItemPortfolio,
  uploadImagemPortfolio,
} from "../services/servico_vitrine_admin";

interface Props {
  driverId: string;
  tenantId: string;
  servicos: TipoServico[];
}

export function SecaoPortfolioAdmin({ driverId, tenantId, servicos }: Props) {
  const [itens, setItens] = useState<ItemPortfolio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [servicoId, setServicoId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const resetar = () => {
    setArquivo(null);
    setPreviewUrl(null);
    setServicoId("");
    setCaption("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const escolherArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    setArquivo(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const salvar = async () => {
    if (!arquivo) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (!servicoId) {
      toast.error("Escolha o serviço relacionado");
      return;
    }
    setEnviando(true);
    try {
      const url = await uploadImagemPortfolio(driverId, arquivo);
      await adicionarItemPortfolio({
        driver_id: driverId,
        tenant_id: tenantId,
        service_type_id: servicoId,
        image_url: url,
        caption: caption.trim() || null,
        ordem: itens.filter((i) => i.service_type_id === servicoId).length,
      });
      toast.success("Trabalho adicionado ao portfólio");
      setAberto(false);
      resetar();
      await carregar();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar");
    } finally {
      setEnviando(false);
    }
  };

  const remover = async (item: ItemPortfolio) => {
    if (!confirm("Remover este trabalho do portfólio?")) return;
    try {
      await removerItemPortfolio(item.id, item.image_url);
      toast.success("Removido");
      setItens((lista) => lista.filter((i) => i.id !== item.id));
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const mapaServicos = new Map(servicos.map((s) => [s.id, s]));

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
          onClick={() => setAberto(true)}
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
            <div className="grid grid-cols-3 gap-1.5">
              {itens.map((item) => {
                const servico = mapaServicos.get(item.service_type_id);
                return (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border bg-card group"
                  >
                    <img
                      src={item.image_url}
                      alt={item.caption ?? servico?.name ?? "Trabalho"}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {servico && (
                      <span className="absolute bottom-1 left-1 right-1 truncate rounded-sm bg-background/70 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-foreground">
                        {servico.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => remover(item)}
                      className="absolute top-1 right-1 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-destructive"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog
        open={aberto}
        onOpenChange={(o) => {
          setAberto(o);
          if (!o) resetar();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar trabalho</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Imagem</Label>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full h-40 rounded-lg border border-dashed border-border bg-card flex items-center justify-center overflow-hidden"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">Tocar para selecionar</span>
                  </div>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={escolherArquivo}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port_serv">Serviço relacionado</Label>
              <Select value={servicoId} onValueChange={setServicoId}>
                <SelectTrigger id="port_serv" className="h-11">
                  <SelectValue placeholder="Escolha um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port_cap">Legenda (opcional)</Label>
              <Input
                id="port_cap"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Corte degradê com navalha"
                maxLength={120}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={enviando}>
              {enviando ? "Enviando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
