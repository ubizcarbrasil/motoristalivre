import { Link } from "react-router-dom";
import { CardPerfilAcesso } from "../components/card_perfil_acesso";
import { PERFIS_ACESSO } from "../constants/constantes_perfis_acesso";

export default function PaginaAcesso() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10 sm:py-14">
        <header className="space-y-3 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            TriboCar
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Acessos por perfil
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Escolha seu perfil para entrar ou criar sua conta. Cada perfil tem
            seu próprio fluxo dedicado.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERFIS_ACESSO.map((perfil) => (
            <CardPerfilAcesso key={perfil.id} perfil={perfil} />
          ))}
        </section>

        <footer className="space-y-2 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            Já tem o link da tribo?{" "}
            <span className="font-mono text-foreground">/SEU_SLUG</span> ou{" "}
            <span className="font-mono text-foreground">/SEU_SLUG/SLUG_DO_MOTORISTA</span>
          </p>
          <p>
            <Link to="/" className="text-primary hover:underline">
              Voltar ao site
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
