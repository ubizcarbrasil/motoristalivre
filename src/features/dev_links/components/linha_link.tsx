import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { LinkItem } from "../types/tipos_dev_links";

interface LinhaLinkProps {
  item: LinkItem;
}

export function LinhaLink({ item }: LinhaLinkProps) {
  const urlAbsoluta =
    typeof window !== "undefined" ? `${window.location.origin}${item.url}` : item.url;

  function copiar() {
    navigator.clipboard.writeText(urlAbsoluta);
    toast.success("Link copiado");
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.rotulo}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{item.url}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button size="icon" variant="ghost" onClick={copiar} aria-label="Copiar link">
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" asChild aria-label="Abrir em nova aba">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
