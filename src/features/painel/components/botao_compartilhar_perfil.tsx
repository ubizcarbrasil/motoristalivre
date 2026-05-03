import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BotaoCompartilharPerfilProps {
  handle: string | null;
  nome?: string | null;
}

/**
 * Botão de compartilhar o link público /p/:handle do profissional.
 * Usa Web Share API quando disponível, senão copia o link.
 */
export function BotaoCompartilharPerfil({ handle, nome }: BotaoCompartilharPerfilProps) {
  const [copiado, setCopiado] = useState(false);

  if (!handle) return null;

  const url = `${window.location.origin}/p/${handle}`;

  async function compartilhar() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: nome ?? `@${handle}`,
          text: `Conheça o perfil de ${nome ?? `@${handle}`} no TriboCar`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast.success("Link copiado");
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // usuário cancelou o share
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    toast.success("Link copiado");
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Compartilhar perfil</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Seu perfil público com todas as suas tribos.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-[11px] text-foreground/90 truncate bg-secondary/60 rounded px-2 py-1.5">
          {url}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copiar}
          className="h-8 px-2 shrink-0"
        >
          {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={compartilhar}
          className="h-8 px-3 shrink-0"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
}
