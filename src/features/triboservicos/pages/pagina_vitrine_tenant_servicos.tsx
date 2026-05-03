import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemaServicos } from "../components/tema_servicos";
import { CabecalhoVitrineTenant } from "../components/cabecalho_vitrine_tenant";
import { CardProfissionalVitrine } from "../components/card_profissional_vitrine";
import { SecaoPreviewPortfolioTenant } from "../components/secao_preview_portfolio_tenant";
import { SecaoComoAgendarTenant } from "../components/secao_como_agendar_tenant";

import { useSeoBasico } from "@/compartilhados/hooks/hook_seo_basico";
import {
  buscarTenantPublicoServicos,
  listarProfissionaisVitrine,
  listarPreviewPortfolioTenant,
  type TenantPublicoServicos,
  type ProfissionalVitrine,
  type ItemPreviewPortfolioTenant,
} from "../services/servico_vitrine_publica";

export default function PaginaVitrineTenantServicos() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantPublicoServicos | null>(null);
  const [profissionais, setProfissionais] = useState<ProfissionalVitrine[]>([]);
  const [preview, setPreview] = useState<ItemPreviewPortfolioTenant[]>([]);
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
      const [lista, previewItens] = await Promise.all([
        listarProfissionaisVitrine(t.id),
        listarPreviewPortfolioTenant(t.id, 6),
      ]);
      if (cancelado) return;
      setProfissionais(lista);
      setPreview(previewItens);
      setCarregando(false);
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  const titulo = tenant
    ? `${tenant.name} — Profissionais e agendamento | TriboServiços`
    : "TriboServiços";
  const descricao = tenant
    ? tenant.branding?.description ??
      `Conheça os profissionais de ${tenant.name} e agende seu serviço online.`
    : undefined;
  const canonical = tenant
    ? `${window.location.origin}/s/${tenant.slug}`
    : undefined;
  useSeoBasico({ titulo, descricao, canonical });

  function rolarParaProfissionais() {
    document
      .getElementById("profissionais")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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

  return (
    <TemaServicos>
      <main className="min-h-screen bg-background pb-16">
        <CabecalhoVitrineTenant tenant={tenant} />

        <section className="max-w-3xl mx-auto px-4 mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between rounded-2xl border border-border bg-card/40 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Pronto para agendar?
              </p>
              <p className="text-xs text-muted-foreground">
                {profissionais.length > 0
                  ? `${profissionais.length} ${profissionais.length === 1 ? "profissional disponível" : "profissionais disponíveis"}`
                  : "Em breve novos profissionais"}
              </p>
            </div>
            <Button
              onClick={rolarParaProfissionais}
              disabled={profissionais.length === 0}
              className="shrink-0"
            >
              Ver profissionais
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/orcamento/novo")}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/15 transition-colors p-4 text-left"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-primary">
                Solicitar orçamento
              </p>
              <p className="text-xs text-muted-foreground">
                Conte o que precisa e receba propostas dos profissionais.
              </p>
            </div>
            <FileText className="w-5 h-5 text-primary shrink-0" />
          </button>
        </section>

        <SecaoPreviewPortfolioTenant itens={preview} tenantSlug={tenant.slug} />

        <section
          id="profissionais"
          className="max-w-3xl mx-auto px-4 mt-12 space-y-4 scroll-mt-4"
        >
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
    </TemaServicos>
  );
}
