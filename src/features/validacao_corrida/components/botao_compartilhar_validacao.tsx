import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BotaoCompartilharValidacaoProps {
  rideId: string;
  nomeEmpresa: string | null;
  cor: string;
}

export function BotaoCompartilharValidacao({
  rideId,
  nomeEmpresa,
  cor,
}: BotaoCompartilharValidacaoProps) {
  const [compartilhando, setCompartilhando] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/validar-corrida/${rideId}`
      : "";

  const titulo = "Comprovante de corrida";
  const texto = nomeEmpresa
    ? `Comprovante de corrida validado por ${nomeEmpresa}`
    : "Comprovante de corrida verificado";

  const suportaShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function compartilhar() {
    setCompartilhando(true);
    try {
      if (suportaShare) {
        await navigator.share({ title: titulo, text: texto, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado", {
          description: "Cole onde precisar para compartilhar.",
        });
      }
    } catch (err) {
      // Usuário cancelou o share — não mostrar erro.
      const msg = (err as Error)?.name;
      if (msg !== "AbortError") {
        toast.error("Não foi possível compartilhar");
      }
    } finally {
      setCompartilhando(false);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={compartilhar}
        disabled={compartilhando}
        className="flex-1 h-11 gap-2 font-medium text-white"
        style={{ backgroundColor: cor }}
      >
        <Share2 className="w-4 h-4" />
        {suportaShare ? "Compartilhar comprovante" : "Copiar link"}
      </Button>
      {suportaShare && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={copiar}
          className="h-11 w-11 shrink-0"
          aria-label="Copiar link"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
