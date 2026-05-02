import { Link } from "react-router-dom";
import { CardPerfilAcesso } from "../components/card_perfil_acesso";
import { PERFIS_ACESSO } from "../constants/constantes_perfis_acesso";

export default function PaginaAcesso() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="mx-auto max-w-5xl px-4 py-8 space-y-8 sm:py-14 sm:space-y-10"
        style={{
          paddingTop: "max(2rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        <header className="space-y-2 text-center sm:space-y-3">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary sm:text-xs">
            TriboCar
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Acessos por perfil
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Escolha seu perfil para entrar ou criar sua conta. Cada perfil tem
            seu próprio fluxo dedicado.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {PERFIS_ACESSO.map((perfil) => (
            <CardPerfilAcesso key={perfil.id} perfil={perfil} />
          ))}
        </section>

        <footer className="space-y-2 border-t border-border pt-6 text-center text-[11px] text-muted-foreground sm:text-xs">
          <p className="break-words">
            Já tem o link da tribo?{" "}
            <span className="font-mono text-foreground">/SEU_SLUG</span>{" "}
            <span className="block sm:inline">
              ou{" "}
              <span className="font-mono text-foreground">
                /SEU_SLUG/SLUG_DO_MOTORISTA
              </span>
            </span>
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
