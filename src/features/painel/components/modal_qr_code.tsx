import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ModalQrCodeProps {
  aberto: boolean;
  onFechar: () => void;
  url: string;
  titulo: string;
}

export function ModalQrCode({ aberto, onFechar, url, titulo }: ModalQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!aberto || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => undefined);
  }, [aberto, url]);

  const baixar = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${titulo.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription className="break-all text-xs font-mono">
            {url}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center bg-white p-4 rounded-xl">
          <canvas ref={canvasRef} />
        </div>
        <Button onClick={baixar} variant="outline" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Baixar PNG
        </Button>
      </DialogContent>
    </Dialog>
  );
}
