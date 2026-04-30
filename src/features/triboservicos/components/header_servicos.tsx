import { Link } from "react-router-dom";
import { LogoTriboServicos } from "./logo_triboservicos";

export function HeaderServicos() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/s" aria-label="TriboServiços">
          <LogoTriboServicos className="text-base" />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/s/entrar"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Entrar
          </Link>
          <Link
            to="/s/cadastro/profissional"
            className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg"
          >
            Começar
          </Link>
        </nav>
      </div>
    </header>
  );
}
