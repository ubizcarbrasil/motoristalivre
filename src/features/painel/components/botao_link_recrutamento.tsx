import { useState } from "react";
import { Copy, Check, ExternalLink, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { montarLinkRecrutamento } from "../services/servico_minhas_tribos";

interface BotaoLinkRecrutamentoProps {
  signupSlug: string | null;
  nomeTribo: string;
  /** Compacto exibe só o botão "Copiar link". Padrão exibe URL + ações. */
  variante?: "compacto" | "completo";
}

export function BotaoLinkRecrutamento({
  signupSlug,
  nomeTribo,
  variante = "completo",
}: BotaoLinkRecrutamentoProps) {
  const [copiado, setCopiado] = useState(false);

  if (!signupSlug) {
    return (
      <p className="text-[11px] text-muted-foreground">
        Configure a categoria principal da tribo para gerar o link de convite.
      </p>
    );
  }

  const link = montarLinkRecrutamento(signupSlug);

  async function copiar() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    toast.success("Link copiado");
    setTimeout(() => setCopiado(false), 1800);
  }

  async function compartilhar() {
    const dados = {
      title: `Entre na tribo ${nomeTribo}`,
      text: `Cadastre-se como profissional na tribo ${nomeTribo}`,
      url: link,
    };
    if (navigator.share) {
      try {
        await navigator.share(dados);
      } catch {
        /* usuário cancelou */
      }
    } else {
      copiar();
    }
  }

  if (variante === "compacto") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={copiar}
        className="h-8 gap-1.5"
      >
        {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="text-xs">{copiado ? "Copiado" : "Copiar link de convite"}</span>
      </Button>
    );
  }

  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-2 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link2 className="w-3 h-3" />
        Link de convite da tribo
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-[11px] text-foreground/90 truncate bg-secondary/60 rounded px-2 py-1.5">
          {link}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copiar}
          className="h-8 px-2 shrink-0"
          title="Copiar link"
        >
          {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={compartilhar}
          className="h-8 px-2 shrink-0"
          title="Compartilhar"
        >
          <Share2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => window.open(link, "_blank")}
          className="h-8 px-2 shrink-0"
          title="Abrir"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
