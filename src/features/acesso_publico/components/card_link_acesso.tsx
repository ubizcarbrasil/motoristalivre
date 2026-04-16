import { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { LinkAcesso } from "../constants/constantes_acesso";
import { URL_BASE_PUBLICA } from "../constants/constantes_acesso";

interface Props {
  link: LinkAcesso;
}

export function CardLinkAcesso({ link }: Props) {
  const [copiado, setCopiado] = useState(false);
  const urlCompleta = `${URL_BASE_PUBLICA}${link.caminho}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(urlCompleta);
      setCopiado(true);
      toast.success("Link copiado");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const abrir = () => {
    window.open(urlCompleta, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{link.titulo}</h3>
        <p className="text-xs text-muted-foreground">{link.descricao}</p>
      </div>
      <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground font-mono break-all">
        {urlCompleta}
      </div>
      <div className="flex gap-2">
        <Button onClick={abrir} size="sm" className="flex-1 gap-2">
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir
        </Button>
        <Button onClick={copiar} variant="outline" size="sm" className="gap-2">
          {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiado ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
