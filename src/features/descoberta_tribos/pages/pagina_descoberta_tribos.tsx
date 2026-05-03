import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { HeaderLanding } from "@/features/landing/components/header_landing";
import { RodapeLanding } from "@/features/landing/components/rodape_landing";
import { useDescobertaTribos } from "../hooks/hook_descoberta_tribos";
import { BarraFiltrosTribos } from "../components/barra_filtros_tribos";
import { GridTribos } from "../components/grid_tribos";

export default function PaginaDescobertaTribos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtros, setFiltros, tribos, categorias, cidades, carregando } =
    useDescobertaTribos({
      busca: searchParams.get("q") ?? undefined,
      categoriaSlug: searchParams.get("categoria") ?? undefined,
      cidade: searchParams.get("cidade") ?? undefined,
    });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filtros.busca) params.q = filtros.busca;
    if (filtros.categoriaSlug) params.categoria = filtros.categoriaSlug;
    if (filtros.cidade) params.cidade = filtros.cidade;
    setSearchParams(params, { replace: true });
  }, [filtros.busca, filtros.categoriaSlug, filtros.cidade, setSearchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderLanding />
      <main className="flex-1 pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar para a home
          </Link>

          <header className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Tribos na plataforma
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Busque por nome, filtre por categoria e cidade para encontrar a tribo certa.
            </p>
          </header>

          <BarraFiltrosTribos
            filtros={filtros}
            categorias={categorias}
            cidades={cidades}
            onChange={setFiltros}
          />

          <p className="text-xs text-muted-foreground">
            {carregando
              ? "Carregando..."
              : `${tribos.length} tribo${tribos.length === 1 ? "" : "s"} encontrada${tribos.length === 1 ? "" : "s"}`}
          </p>

          <GridTribos tribos={tribos} carregando={carregando} />
        </div>
      </main>
      <RodapeLanding />
    </div>
  );
}
