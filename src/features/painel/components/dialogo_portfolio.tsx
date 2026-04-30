import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, AlertCircle } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";
import type { ItemPortfolio } from "@/features/motorista/types/tipos_vitrine";
import {
  schemaItemPortfolio,
  validarArquivoPortfolio,
  PORTFOLIO_CAPTION_MAX,
  PORTFOLIO_DIMENSAO_MIN,
  PORTFOLIO_TAMANHO_MAX_MB,
} from "../schemas/schema_portfolio";

export type ModoDialogoPortfolio =
  | { tipo: "criar"; servicoIdInicial?: string }
  | { tipo: "editar"; item: ItemPortfolio };

interface Props {
  aberto: boolean;
  modo: ModoDialogoPortfolio | null;
  servicos: TipoServico[];
  enviando: boolean;
  onFechar: () => void;
  onSalvarCriacao: (params: {
    arquivo: File;
    service_type_id: string;
    caption: string | null;
  }) => Promise<void>;
  onSalvarEdicao: (params: {
    id: string;
    service_type_id: string;
    caption: string | null;
  }) => Promise<void>;
}

export function DialogoPortfolio({
  aberto,
  modo,
  servicos,
  enviando,
  onFechar,
  onSalvarCriacao,
  onSalvarEdicao,
}: Props) {
  const ehEdicao = modo?.tipo === "editar";
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [servicoId, setServicoId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reseta/popula ao abrir
  useEffect(() => {
    if (!aberto || !modo) return;
    setArquivo(null);
    setErroArquivo(null);
    if (modo.tipo === "criar") {
      setPreviewUrl(null);
      setServicoId(modo.servicoIdInicial ?? "");
      setCaption("");
    } else {
      setPreviewUrl(modo.item.image_url);
      setServicoId(modo.item.service_type_id);
      setCaption(modo.item.caption ?? "");
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [aberto, modo]);

  const handleEscolherArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setValidando(true);
    setErroArquivo(null);
    const r = await validarArquivoPortfolio(f);
    setValidando(false);

    if (!r.ok) {
      setErroArquivo(r.mensagem ?? "Imagem inválida");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setArquivo(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSalvar = async () => {
    // Valida campos textuais
    const parsed = schemaItemPortfolio.safeParse({
      service_type_id: servicoId,
      caption: caption,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    if (!modo) return;

    if (modo.tipo === "criar") {
      if (!arquivo) {
        toast.error("Selecione uma imagem");
        return;
      }
      await onSalvarCriacao({
        arquivo,
        service_type_id: parsed.data.service_type_id,
        caption: parsed.data.caption,
      });
    } else {
      await onSalvarEdicao({
        id: modo.item.id,
        service_type_id: parsed.data.service_type_id,
        caption: parsed.data.caption,
      });
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ehEdicao ? "Editar trabalho" : "Adicionar trabalho"}</DialogTitle>
          <DialogDescription className="text-[11px]">
            JPG, PNG ou WebP · até {PORTFOLIO_TAMANHO_MAX_MB}MB · mínimo{" "}
            {PORTFOLIO_DIMENSAO_MIN}x{PORTFOLIO_DIMENSAO_MIN}px
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Imagem</Label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={ehEdicao || validando}
              className="w-full h-40 rounded-lg border border-dashed border-border bg-card flex items-center justify-center overflow-hidden disabled:opacity-70 disabled:cursor-default"
            >
              {validando ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : previewUrl ? (
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
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleEscolherArquivo}
            />
            {erroArquivo && (
              <div className="flex items-start gap-1.5 text-[11px] text-destructive">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{erroArquivo}</span>
              </div>
            )}
            {ehEdicao && (
              <p className="text-[10px] text-muted-foreground">
                Para trocar a imagem, remova este item e adicione um novo.
              </p>
            )}
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
            <Label htmlFor="port_cap">
              Legenda{" "}
              <span className="text-[10px] text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="port_cap"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Corte degradê com navalha"
              maxLength={PORTFOLIO_CAPTION_MAX}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {caption.length}/{PORTFOLIO_CAPTION_MAX}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={enviando || validando}>
            {enviando ? "Salvando..." : ehEdicao ? "Salvar alterações" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
