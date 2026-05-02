import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { TemaServicos } from "@/features/triboservicos/components/tema_servicos";
import { FooterServicos } from "@/features/triboservicos/components/footer_servicos";
import { useSeoBasico } from "@/compartilhados/hooks/hook_seo_basico";
import { useHookRedePublica } from "../hooks/hook_rede_publica";
import { FiltrosRedePublica } from "../components/filtros_rede_publica";
import { ListaRedePublica } from "../components/lista_rede_publica";

export default function PaginaRedePublica() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  const navigate = useNavigate();

  const {
    dono,
    membros,
    membrosFiltrados,
    categoriasDisponiveis,
    carregando,
    erro,
    busca,
    setBusca,
    categoria,
    setCategoria,
    status,
    setStatus,
  } = useHookRedePublica(slug, driver_slug);

  const tituloSeo = dono ? `Rede de ${dono.nome} — TriboServiços` : "Rede de profissionais";
  const descricaoSeo = dono
    ? `Conheça a rede de profissionais associados a ${dono.nome}. Filtre por categoria e disponibilidade e agende com quem atende sua necessidade.`
    : undefined;
  const canonicalSeo =
    slug && driver_slug
      ? `${window.location.origin}/s/${slug}/${driver_slug}/rede`
      : undefined;
  useSeoBasico({ titulo: tituloSeo, descricao: descricaoSeo, canonical: canonicalSeo });

  if (carregando) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (erro || !dono || !slug || !driver_slug) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">Rede não encontrada</p>
            <p className="text-sm text-muted-foreground">
              Verifique se o endereço está correto.
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  return (
    <TemaServicos>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 h-12 bg-background/85 backdrop-blur border-b border-border">
        <button
          onClick={() => navigate(`/s/${slug}/${driver_slug}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
          aria-label="Voltar para o perfil"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-xs text-muted-foreground truncate">
          Rede de <span className="text-foreground font-medium">{dono.nome}</span>
        </p>
        <div className="w-9" />
      </div>

      <main className="min-h-screen bg-background pb-20">
        <header className="max-w-3xl mx-auto px-4 pt-6 pb-4 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              Rede de profissionais
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {membros.length === 0
              ? `${dono.nome} ainda não tem profissionais associados.`
              : `${membros.length} ${
                  membros.length === 1 ? "profissional indicado" : "profissionais indicados"
                } por ${dono.nome}. Cada um com sua agenda e seus preços.`}
          </p>
        </header>

        {membros.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 space-y-4">
            <FiltrosRedePublica
              busca={busca}
              onBusca={setBusca}
              categoria={categoria}
              onCategoria={setCategoria}
              status={status}
              onStatus={setStatus}
              categoriasDisponiveis={categoriasDisponiveis}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {membrosFiltrados.length} de {membros.length}
              </span>
            </div>

            <ListaRedePublica membros={membrosFiltrados} tenantSlug={slug} />
          </section>
        )}
      </main>

      <FooterServicos />
    </TemaServicos>
  );
}
