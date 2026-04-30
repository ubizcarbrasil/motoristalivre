import { Link } from "react-router-dom";
import { LogoTriboServicos } from "./logo_triboservicos";

export function FooterServicos() {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <LogoTriboServicos className="text-lg" />
            <p className="text-sm text-muted-foreground max-w-xs">
              A plataforma de agenda e link público para profissionais de serviços. Parte da
              família TriboCar.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Produto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/s/cadastro/profissional" className="hover:text-foreground transition-colors">
                  Sou profissional
                </Link>
              </li>
              <li>
                <Link to="/s/cadastro/tribo" className="hover:text-foreground transition-colors">
                  Sou operadora
                </Link>
              </li>
              <li>
                <Link to="/s/entrar" className="hover:text-foreground transition-colors">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Família TriboCar</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  TriboCar Mobilidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} TriboCar. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
