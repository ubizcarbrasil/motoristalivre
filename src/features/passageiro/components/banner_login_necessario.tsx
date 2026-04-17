import { Button } from "@/components/ui/button";
import { LogIn, Info } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function BannerLoginNecessario() {
  const navigate = useNavigate();
  const location = useLocation();

  const irParaLogin = () => {
    const destinoAposLogin = `${location.pathname}${location.search}`;
    navigate(`/entrar?redirectTo=${encodeURIComponent(destinoAposLogin)}`);
  };

  return (
    <div className="absolute top-0 inset-x-0 z-20 px-3 pt-3">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Entre para solicitar corrida
          </p>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5">
            Você pode escolher origem e destino antes.
          </p>
        </div>
        <Button
          size="sm"
          onClick={irParaLogin}
          className="shrink-0 h-9 rounded-full gap-1.5 px-3"
          aria-label="Entrar"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </Button>
      </div>
    </div>
  );
}
