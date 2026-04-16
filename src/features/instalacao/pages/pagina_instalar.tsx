import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function ehIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function ehAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

function ehStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
}

export default function PaginaInstalar() {
  const navigate = useNavigate();
  const ios = ehIOS();
  const android = ehAndroid();
  const instalado = ehStandalone();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">Instalar app</span>
      </div>

      <div className="px-6 py-8 max-w-md mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">T</span>
          </div>
          <h1 className="text-2xl font-bold">Instale o TriboCar</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Adicione o app à tela inicial do seu celular para acessar corridas em fullscreen, sem barra do navegador.
          </p>
        </div>

        {instalado && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              App já está instalado neste dispositivo.
            </p>
          </div>
        )}

        {!instalado && ios && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Como instalar no iPhone</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Toque no botão Compartilhar</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Share className="w-3.5 h-3.5" /> Fica na barra inferior do Safari
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Selecione "Adicionar à Tela de Início"</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Role o menu se precisar
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">3</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Toque em "Adicionar"</p>
                  <p className="text-xs text-muted-foreground">O ícone aparece na sua tela inicial</p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {!instalado && android && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Como instalar no Android</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>
                <p className="text-sm">Toque no menu do navegador (três pontos no canto)</p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
                <p className="text-sm">Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"</p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">3</span>
                <p className="text-sm">Confirme a instalação</p>
              </li>
            </ol>
          </div>
        )}

        {!instalado && !ios && !android && (
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Acesse esta página pelo navegador do seu celular (iPhone ou Android) para instalar o app.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <h3 className="text-sm font-semibold">Vantagens de instalar</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• Abre em fullscreen, sem barra do navegador</li>
            <li>• Acesso direto pelo ícone na tela inicial</li>
            <li>• Carrega mais rápido</li>
            <li>• Parece um app nativo</li>
          </ul>
        </div>

        <Button onClick={() => navigate("/painel")} className="w-full h-12">
          Voltar ao painel
        </Button>
      </div>
    </div>
  );
}
