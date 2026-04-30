import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { TemaServicos } from "../components/tema_servicos";
import { CabecalhoVitrineTenant } from "../components/cabecalho_vitrine_tenant";
import { CardProfissionalVitrine } from "../components/card_profissional_vitrine";
import { FooterServicos } from "../components/footer_servicos";
import {
  buscarTenantPublicoServicos,
  listarProfissionaisVitrine,
  type TenantPublicoServicos,
  type ProfissionalVitrine,
} from "../services/servico_vitrine_publica";

export default function PaginaVitrineTenantServicos() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<TenantPublicoServicos | null>(null);
  const [profissionais, setProfissionais] = useState<ProfissionalVitrine[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelado = false;
    async function carregar() {
      const t = await buscarTenantPublicoServicos(slug!);
      if (cancelado) return;
      if (!t) {
        setNaoEncontrado(true);
        setCarregando(false);
        return;
      }
      setTenant(t);
      const lista = await listarProfissionaisVitrine(t.id);
      if (cancelado) return;
      setProfissionais(lista);
      setCarregando(false);
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (carregando) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (naoEncontrado || !tenant) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">Tribo não encontrada</p>
            <p className="text-sm text-muted-foreground">
              Verifique se o endereço está correto.
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  const titulo = `${tenant.name} — Profissionais e agendamento | TriboServiços`;
  const descricao =
    tenant.branding?.description ??
    `Conheça os profissionais de ${tenant.name} e agende seu serviço online.`;

  return (
    <TemaServicos>
      <Helmet>
        <title>{titulo.slice(0, 60)}</title>
        <meta name="description" content={descricao.slice(0, 160)} />
        <link
          rel="canonical"
          href={`${window.location.origin}/s/${tenant.slug}`}
        />
      </Helmet>

      <main className="min-h-screen bg-background pb-16">
        <CabecalhoVitrineTenant tenant={tenant} />

        <section className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Profissionais disponíveis
            </h2>
            <p className="text-sm text-muted-foreground">
              Escolha um profissional para ver portfólio e agendar.
            </p>
          </div>

          {profissionais.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum profissional com serviços ativos por aqui ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {profissionais.map((p) => (
                <CardProfissionalVitrine key={p.id} profissional={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <FooterServicos />
    </TemaServicos>
  );
}
