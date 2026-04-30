import { useState } from "react";
import { Car, Share2, Users, Copy, QrCode, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalQrCode } from "./modal_qr_code";
import type { CanalLink } from "../types/tipos_meus_links";

const ICONES = {
  motorista: Car,
  afiliado: Share2,
  grupo: Users,
  servicos: Sparkles,
} as const;
const CORES_HANDLE = {
  roxo: "text-purple-400",
  azul: "text-blue-400",
  verde: "text-primary",
  dourado: "text-amber-400",
} as const;
const CORES_BORDA = {
  roxo: "border-purple-500/30",
  azul: "border-blue-500/30",
  verde: "border-primary/30",
  dourado: "border-amber-500/40",
} as const;

interface CardLinkCanalProps {
  canal: CanalLink;
}

function formatarBRL(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

export function CardLinkCanal({ canal }: CardLinkCanalProps) {
  const [qrAberto, setQrAberto] = useState(false);
  const Icone = ICONES[canal.tipo];

  const copiar = async () => {
    await navigator.clipboard.writeText(canal.url);
    toast.success("Link copiado");
  };

  const compartilhar = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: canal.titulo, text: canal.descricao, url: canal.url });
      } catch {
        // usuário cancelou
      }
    } else {
      copiar();
    }
  };

  return (
    <>
      <div className={`rounded-2xl bg-card border ${CORES_BORDA[canal.cor]} p-4 space-y-3`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Icone className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{canal.titulo}</h3>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              {canal.descricao}
            </p>
          </div>
        </div>

        <div className={`text-xs font-mono ${CORES_HANDLE[canal.cor]} bg-secondary rounded-lg px-3 py-2 truncate`}>
          {canal.url}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-secondary py-2">
            <p className="text-sm font-bold text-foreground">{canal.stats.corridas}</p>
            <p className="text-[10px] text-muted-foreground">Corridas/mês</p>
          </div>
          <div className="rounded-lg bg-secondary py-2">
            <p className="text-sm font-bold text-foreground">
              {canal.stats.conversao.toFixed(0)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Conversão</p>
          </div>
          <div className="rounded-lg bg-secondary py-2">
            <p className="text-sm font-bold text-foreground">
              {formatarBRL(canal.stats.ganhos)}
            </p>
            <p className="text-[10px] text-muted-foreground">Ganhos/mês</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={copiar} className="gap-1.5 h-9 text-xs">
            <Copy className="w-3.5 h-3.5" /> Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={compartilhar} className="gap-1.5 h-9 text-xs">
            <Send className="w-3.5 h-3.5" /> Enviar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQrAberto(true)} className="gap-1.5 h-9 text-xs">
            <QrCode className="w-3.5 h-3.5" /> QR
          </Button>
        </div>
      </div>

      <ModalQrCode
        aberto={qrAberto}
        onFechar={() => setQrAberto(false)}
        url={canal.url}
        titulo={canal.titulo}
      />
    </>
  );
}
