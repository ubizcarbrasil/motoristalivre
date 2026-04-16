import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
}

const STORAGE_KEY = "tribocar_pwa_dismissed";

export function SheetInstalacao() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const jaDismissed = localStorage.getItem(STORAGE_KEY);
    if (jaDismissed || isStandalone()) return;

    const timer = setTimeout(() => setVisivel(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fechar = () => {
    setVisivel(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visivel) return null;

  const ios = isIOS();
  const android = isAndroid();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="mx-4 mb-4 bg-card border border-border rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Instale o TriboCar</h3>
          <button type="button" onClick={fechar} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Adicione o app à tela inicial para acessar corridas de forma rápida, sem precisar abrir o navegador.
        </p>

        {ios && (
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Toque no botão de compartilhar do Safari</p>
            <p>2. Selecione "Adicionar à Tela de Início"</p>
            <p>3. Toque em "Adicionar"</p>
          </div>
        )}

        {android && (
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Toque no menu do navegador (tres pontos)</p>
            <p>2. Selecione "Adicionar à tela inicial"</p>
            <p>3. Confirme a instalação</p>
          </div>
        )}

        {!ios && !android && (
          <p className="text-xs text-muted-foreground">
            Acesse pelo celular para instalar o aplicativo.
          </p>
        )}

        <Button variant="outline" onClick={fechar} className="w-full mt-4 h-10 text-sm">
          Entendi
        </Button>
      </div>
    </div>
  );
}
