import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeaderLanding() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
        <Link to="/" className="text-lg font-bold text-foreground">
          Tribo<span className="text-primary">Car</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/entrar">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/cadastro">Cadastro</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
