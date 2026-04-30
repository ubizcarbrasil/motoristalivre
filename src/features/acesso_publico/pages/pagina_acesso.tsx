import { CardLinkAcesso } from "../components/card_link_acesso";
import { BlocoCredenciais } from "../components/bloco_credenciais";
import { LINKS_ACESSO } from "../constants/constantes_acesso";

const SECOES = [
  { id: "passageiro" as const, titulo: "App do passageiro" },
  { id: "motorista" as const, titulo: "App do motorista" },
  { id: "servicos" as const, titulo: "Módulo Serviços" },
  { id: "dev" as const, titulo: "Ferramentas de teste" },
];

export default function PaginaAcesso() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Acessos públicos</h1>
          <p className="text-sm text-muted-foreground">
            Links diretos para abrir o app fora do editor. Funciona em qualquer navegador.
          </p>
        </header>

        <BlocoCredenciais />

        {SECOES.map((secao) => {
          const links = LINKS_ACESSO.filter((l) => l.categoria === secao.id);
          if (!links.length) return null;
          return (
            <section key={secao.id} className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {secao.titulo}
              </h2>
              <div className="space-y-3">
                {links.map((link) => (
                  <CardLinkAcesso key={link.id} link={link} />
                ))}
              </div>
            </section>
          );
        })}

        <footer className="pt-4 text-xs text-muted-foreground text-center">
          Para usar com seu grupo real: <span className="font-mono">/SEU_SLUG</span> ou{" "}
          <span className="font-mono">/SEU_SLUG/SLUG_DO_MOTORISTA</span>
        </footer>
      </div>
    </div>
  );
}
