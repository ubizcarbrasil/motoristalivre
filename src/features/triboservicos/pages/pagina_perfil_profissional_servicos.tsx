import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TemaServicos } from "../components/tema_servicos";
import { CabecalhoPerfilProfissional } from "../components/cabecalho_perfil_profissional";
import { GaleriaPortfolio } from "../components/galeria_portfolio";
import { FiltrosPortfolio } from "../components/filtros_portfolio";
import { PaginacaoPortfolio } from "../components/paginacao_portfolio";
import { useFiltroPortfolio } from "../hooks/hook_filtro_portfolio";
import { ListaServicosOferecidos } from "../components/lista_servicos_oferecidos";
import { FooterServicos } from "../components/footer_servicos";
import { useSeoBasico } from "@/compartilhados/hooks/hook_seo_basico";
import { useDadosServicoMotorista } from "@/features/passageiro/hooks/hook_dados_servico_motorista";
import {
  buscarTenantPublicoServicos,
  resolverDriverVitrine,
  listarPortfolioProfissional,
  type ItemPortfolio,
  type TenantPublicoServicos,
} from "../services/servico_vitrine_publica";

export default function PaginaPerfilProfissionalServicos() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<TenantPublicoServicos | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<ItemPortfolio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug || !driver_slug) return;
    let cancelado = false;
    async function carregar() {
      const [tenantData, resolucao] = await Promise.all([
        buscarTenantPublicoServicos(slug!),
        resolverDriverVitrine(slug!, driver_slug!),
      ]);
      if (cancelado) return;
      if (!tenantData || !resolucao) {
        setErro(true);
        setCarregando(false);
        return;
      }
      setTenant(tenantData);
      setDriverId(resolucao.driverId);
      const itens = await listarPortfolioProfissional(resolucao.driverId);
      if (cancelado) return;
      setPortfolio(itens);
      setCarregando(false);
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [slug, driver_slug]);

  const dados = useDadosServicoMotorista(driverId);

  const tituloSeo = dados.full_name
    ? `${dados.full_name} — Serviços e agendamento`
    : "TriboServiços";
  const descricaoSeo =
    dados.full_name && tenant
      ? `Veja portfólio, serviços e agende um horário com ${dados.full_name} em ${tenant.name}.`
      : undefined;
  const canonicalSeo =
    tenant && driver_slug
      ? `${window.location.origin}/s/${tenant.slug}/${driver_slug}`
      : undefined;
  useSeoBasico({ titulo: tituloSeo, descricao: descricaoSeo, canonical: canonicalSeo });

  function compartilhar() {
    const url = `${window.location.origin}/s/${slug}/${driver_slug}`;
    if (navigator.share) {
      navigator
        .share({ title: dados.full_name, url })
        .catch(() => navigator.clipboard.writeText(url));
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }

  function irParaAgendamento(servicoId?: string) {
    const params = servicoId ? `?servico=${servicoId}` : "";
    navigate(`/s/${slug}/${driver_slug}/agendar${params}`);
  }

  if (carregando || (driverId && dados.carregando)) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (erro || !tenant || !driverId) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">
              Profissional não encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique se o endereço está correto.
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  const tipo = dados.professional_type;
  const ofereceServicos = tipo === "service_provider" || tipo === "both";

  return (
    <TemaServicos>

      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 h-12 bg-background/85 backdrop-blur border-b border-border">
        <button
          onClick={() => navigate(`/s/${slug}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
          aria-label="Voltar para vitrine"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={compartilhar}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
          aria-label="Compartilhar perfil"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <main className="min-h-screen bg-background pb-32">
        <CabecalhoPerfilProfissional
          nome={dados.full_name}
          avatarUrl={dados.avatar_url}
          coverUrl={null}
          bio={null}
          isVerified={false}
          credentialVerified={dados.credential_verified}
          credentialType={dados.credential_type}
          serviceCategories={[]}
          cidade={tenant.branding?.city ?? null}
        />

        {!ofereceServicos ? (
          <section className="max-w-3xl mx-auto px-4 mt-8">
            <div className="rounded-xl border border-border p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Este profissional não oferece serviços.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="max-w-3xl mx-auto px-4 mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Portfólio</h2>
              <GaleriaPortfolio itens={portfolio} />
            </section>

            <section className="max-w-3xl mx-auto px-4 mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Serviços oferecidos
              </h2>
              <ListaServicosOferecidos
                servicos={dados.serviceTypes}
                onSelecionar={(id) => irParaAgendamento(id)}
              />
            </section>
          </>
        )}
      </main>

      {ofereceServicos && dados.serviceTypes.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur p-4">
          <div className="max-w-3xl mx-auto">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => irParaAgendamento()}
            >
              <CalendarPlus className="w-4 h-4" />
              Agendar agora
            </Button>
          </div>
        </div>
      )}

      <FooterServicos />
    </TemaServicos>
  );
}
