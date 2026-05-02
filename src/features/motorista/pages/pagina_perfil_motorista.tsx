import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePerfilMotorista } from "../hooks/hook_perfil_motorista";
import { HeaderPerfil } from "../components/header_perfil";
import { GridMetricas } from "../components/grid_metricas";
import { InfoVeiculo } from "../components/info_veiculo";
import { SecaoBio } from "../components/secao_bio";
import { DistribuicaoNotas } from "../components/distribuicao_notas";
import { ListaAvaliacoes } from "../components/lista_avaliacoes";
import { SecaoServicosPublica } from "../components/secao_servicos_publica";
import { SecaoDisponibilidadePublica } from "../components/secao_disponibilidade_publica";
import { SecaoEquipePublica } from "../components/secao_equipe_publica";
import { SecaoCategoriasPortfolio } from "../components/secao_categorias_portfolio";
import { SecaoEspecialidadesPublica } from "../components/secao_especialidades_publica";
import { MessageCircle } from "lucide-react";

export default function PaginaPerfilMotorista() {
  const navigate = useNavigate();
  const {
    perfil,
    metricas,
    distribuicao,
    avaliacoes,
    servicos,
    disponibilidade,
    portfolio,
    equipe,
    carregando,
    erro,
  } = usePerfilMotorista();

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !perfil) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Profissional não encontrado</p>
          <p className="text-sm text-muted-foreground">Verifique se o endereço está correto.</p>
        </div>
      </div>
    );
  }

  const urlBase = `/${perfil.tenant_slug}/${perfil.slug}`;
  const ofereceServico =
    perfil.professional_type === "service_provider" || perfil.professional_type === "both";
  const ofereceCorrida =
    perfil.professional_type === "driver" || perfil.professional_type === "both";
  const temServicosVendaveis = servicos.length > 0;
  const temEspecialidades = perfil.service_categories.length > 0;

  const abrirOrcamentoWhatsapp = () => {
    if (!perfil.whatsapp) return;
    const numero = perfil.whatsapp.replace(/\D/g, "");
    const completo = numero.length <= 11 ? `55${numero}` : numero;
    const mensagem = `Olá ${perfil.nome}, vim pelo TriboServiços e gostaria de solicitar um orçamento.`;
    window.open(
      `https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground">Perfil</span>
      </div>

      <div className="space-y-5 pb-32">
        <HeaderPerfil perfil={perfil} />
        <GridMetricas metricas={metricas} />
        <SecaoBio bio={perfil.bio} />

        {ofereceServico && (
          <>
            <SecaoCategoriasPortfolio servicos={servicos} portfolio={portfolio} />
            <SecaoServicosPublica
              servicos={servicos}
              portfolio={portfolio}
              tenantSlug={perfil.tenant_slug}
              driverSlug={perfil.slug}
            />
            <SecaoEquipePublica membros={equipe} tenantSlug={perfil.tenant_slug} />
            <SecaoDisponibilidadePublica blocos={disponibilidade} />
          </>
        )}

        {ofereceCorrida && <InfoVeiculo perfil={perfil} />}

        <DistribuicaoNotas
          distribuicao={distribuicao}
          notaMedia={metricas.nota_media}
          totalAvaliacoes={metricas.total_avaliacoes}
        />
        <ListaAvaliacoes avaliacoes={avaliacoes} />

        <div className="px-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Grupo</h2>
          <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-3">
            <Badge variant="outline" className="border-primary text-primary">
              {perfil.tenant_nome}
            </Badge>
            <span className="text-xs text-muted-foreground">/{perfil.tenant_slug}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t border-border">
        {perfil.professional_type === "both" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-12 text-sm font-semibold"
              onClick={() => navigate(`${urlBase}?modo=ride`)}
            >
              Solicitar corrida
            </Button>
            <Button
              className="h-12 text-sm font-semibold"
              onClick={() => navigate(`/${perfil.tenant_slug}/servicos/${perfil.slug}`)}
            >
              Agendar serviço
            </Button>
          </div>
        ) : ofereceServico ? (
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={() => navigate(`/${perfil.tenant_slug}/servicos/${perfil.slug}`)}
          >
            Agendar serviço
          </Button>
        ) : (
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={() => navigate(urlBase)}
          >
            Solicitar corrida
          </Button>
        )}
      </div>
    </div>
  );
}
