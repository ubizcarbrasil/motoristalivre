import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TemaServicos } from "@/features/triboservicos/components/tema_servicos";
import { LogoTriboServicos } from "@/features/triboservicos/components/logo_triboservicos";
import { CATEGORIAS_SERVICO } from "@/compartilhados/constants/constantes_categorias_servico";
import { GridCategoriasCadastro } from "../components/grid_categorias_cadastro";

export default function PaginaIndiceCategorias() {
  const categoriasDestaque = CATEGORIAS_SERVICO.filter((c) => c.destaque);
  const demaisCategorias = CATEGORIAS_SERVICO.filter((c) => !c.destaque);

  return (
    <TemaServicos>
      <main className="min-h-screen bg-background pb-16">
        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
          <Link
            to="/s"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar para a landing
          </Link>

          <header className="text-center space-y-3">
            <LogoTriboServicos className="text-lg" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Em qual área você atua?
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Escolha sua categoria principal para criar sua agenda e seu link público.
              Você pode adicionar outras especialidades depois.
            </p>
          </header>

          {categoriasDestaque.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mais procurados
              </h2>
              <GridCategoriasCadastro categorias={categoriasDestaque} />
            </section>
          )}

          {demaisCategorias.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Outras áreas
              </h2>
              <GridCategoriasCadastro categorias={demaisCategorias} />
            </section>
          )}

          <p className="text-center text-xs text-muted-foreground pt-4">
            Não encontrou sua área?{" "}
            <Link to="/s/cadastro/profissional" className="text-primary hover:underline">
              Cadastre-se sem categoria
            </Link>
          </p>
        </div>
      </main>
    </TemaServicos>
  );
}
