import { Link } from "react-router-dom";

export function RodapeLanding() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>TriboCar - Plataforma white-label de transporte</span>
        <nav className="flex gap-4">
          <Link to="/tribos" className="hover:text-foreground transition-colors">
            Tribos
          </Link>
          <Link to="/s/cadastrar" className="hover:text-foreground transition-colors">
            Categorias
          </Link>
        </nav>
        <span>2026 - Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
