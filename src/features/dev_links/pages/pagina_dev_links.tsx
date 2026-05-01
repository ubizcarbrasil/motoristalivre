import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SecaoLinksGlobais } from "../components/secao_links_globais";
import { CardTriboLinks } from "../components/card_tribo_links";
import { useListarTribosDev } from "../hooks/hook_listar_tribos_dev";

export default function PaginaDevLinks() {
  const { tribos, carregando } = useListarTribosDev();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
        <header className="space-y-2">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Dev · QA
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Links para teste
          </h1>
          <p className="text-sm text-muted-foreground">
            Todos os fluxos públicos do sistema, prontos para abrir ou copiar.
          </p>
        </header>

        <SecaoLinksGlobais />

        <section className="space-y-3">
          <header>
            <h2 className="text-lg font-semibold text-foreground">
              Tribos cadastradas
            </h2>
            <p className="text-xs text-muted-foreground">
              {carregando
                ? "Carregando…"
                : `${tribos.length} ${tribos.length === 1 ? "tribo" : "tribos"} no banco.`}
            </p>
          </header>

          {carregando ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : tribos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma tribo cadastrada ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tribos.map((tribo) => (
                <CardTriboLinks key={tribo.id} tribo={tribo} />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-border pt-6 text-center">
          <Link to="/" className="text-xs text-primary hover:underline">
            Voltar ao site
          </Link>
        </footer>
      </div>
    </div>
  );
}
