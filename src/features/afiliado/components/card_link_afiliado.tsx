import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, QrCode } from "lucide-react";
import { toast } from "sonner";
import type { AfiliadoPerfil, StatsAfiliado } from "../types/tipos_afiliado";

interface CardLinkAfiliadoProps {
  perfil: AfiliadoPerfil;
  stats: StatsAfiliado;
}

export function CardLinkAfiliado({ perfil, stats }: CardLinkAfiliadoProps) {
  const [mostrarQR, setMostrarQR] = useState(false);
  const url = `${window.location.origin}/${perfil.tenantSlug}/a/${perfil.slug}`;

  function copiar() {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  }

  function compartilharWhatsApp() {
    const texto = encodeURIComponent(`Solicite sua corrida pelo meu link: ${url}`);
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  }

  return (
    <div className="space-y-4 px-5">
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Seu link de afiliado</p>
            <p className="break-all rounded-md bg-secondary/50 px-3 py-2 text-sm text-foreground">
              {url}
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={copiar}>
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copiar
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={compartilharWhatsApp}>
              <Share2 className="mr-1 h-3.5 w-3.5" />
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMostrarQR(!mostrarQR)}>
              <QrCode className="h-3.5 w-3.5" />
            </Button>
          </div>

          {mostrarQR && (
            <div className="flex justify-center rounded-md bg-white p-4">
              <div className="flex h-32 w-32 items-center justify-center border-2 border-dashed border-muted-foreground/30">
                <p className="text-center text-xs text-muted-foreground">QR Code</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{stats.corridasGeradas}</p>
            <p className="text-xs text-muted-foreground">Corridas</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">R$ {stats.ganhosTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Ganhos</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-primary">R$ {stats.saldoAtual.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Saldo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
