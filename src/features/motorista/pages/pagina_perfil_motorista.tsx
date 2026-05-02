import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePerfilMotorista } from "../hooks/hook_perfil_motorista";
import { SecaoBio } from "../components/secao_bio";
import { SecaoServicosPublica } from "../components/secao_servicos_publica";
import { SecaoEquipePublica } from "../components/secao_equipe_publica";
import { VitrineEspecialidades } from "@/compartilhados/components/vitrine_especialidades";
import { imagemDeCapa } from "@/compartilhados/utils/imagens_categorias";
import { HeroPerfil } from "../components/perfil_publico/hero_perfil";
import { IdentidadePerfil } from "../components/perfil_publico/identidade_perfil";
import { ChipsCategorias } from "../components/perfil_publico/chips_categorias";
import { BlocoConfianca } from "../components/perfil_publico/bloco_confianca";
import { BarraAcaoFixa } from "../components/perfil_publico/barra_acao_fixa";

export default function PaginaPerfilMotorista() {
  const navigate = useNavigate();
  const {
    perfil,
    metricas,
    servicos,
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

  const ofereceServico =
    perfil.professional_type === "service_provider" || perfil.professional_type === "both";
  const ofereceCorrida =
    perfil.professional_type === "driver" || perfil.professional_type === "both";
  const temServicosVendaveis = servicos.length > 0;
  const temEspecialidades = perfil.service_categories.length > 0;
  const coverUrl = perfil.cover_url ?? imagemDeCapa(perfil.service_categories);

  const tipoBarra: "agendar" | "orcamento" | "corrida" | "ambos" | "indisponivel" =
    perfil.professional_type === "both"
      ? "ambos"
      : ofereceServico
        ? temServicosVendaveis
          ? "agendar"
          : "orcamento"
        : ofereceCorrida
          ? "corrida"
          : "indisponivel";

  const compartilhar = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: perfil.nome, url }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Link copiado!");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

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

  const irAgendar = () =>
    navigate(`/${perfil.tenant_slug}/servicos/${perfil.slug}`);
  const irCorrida = () =>
    navigate(`/${perfil.tenant_slug}/${perfil.slug}?modo=ride`);

  return (
    <main className="min-h-screen bg-background pb-32">
      <HeroPerfil
        nome={perfil.nome}
        avatarUrl={perfil.avatar_url}
        coverUrl={coverUrl}
        onVoltar={() => navigate(-1)}
        onCompartilhar={compartilhar}
      />

      <IdentidadePerfil
        nome={perfil.nome}
        tenantNome={perfil.tenant_nome}
        cidade={null}
        isVerified={perfil.is_verified}
        credentialVerified={perfil.credential_verified}
        credentialType={perfil.credential_type}
        notaMedia={metricas.nota_media}
        totalAvaliacoes={metricas.total_avaliacoes}
      />

      <ChipsCategorias categorias={perfil.service_categories} />

      <BlocoConfianca
        isVerified={perfil.is_verified}
        mesesAtuacao={metricas.meses_atuacao}
        taxaAceite={metricas.taxa_aceite}
        totalAvaliacoes={metricas.total_avaliacoes}
      />

      <div className="mt-8 space-y-6">
        <SecaoBio bio={perfil.bio} />

        {ofereceServico && (
          <>
            {temServicosVendaveis ? (
              <SecaoServicosPublica
                servicos={servicos}
                portfolio={portfolio}
                tenantSlug={perfil.tenant_slug}
                driverSlug={perfil.slug}
              />
            ) : (
              temEspecialidades && (
                <VitrineEspecialidades
                  categorias={perfil.service_categories}
                  nomeProfissional={perfil.nome}
                  whatsapp={perfil.whatsapp}
                />
              )
            )}
            <SecaoEquipePublica membros={equipe} tenantSlug={perfil.tenant_slug} />
          </>
        )}
      </div>

      <BarraAcaoFixa
        tipo={tipoBarra}
        whatsappDisponivel={!!perfil.whatsapp}
        onAgendar={irAgendar}
        onOrcamento={abrirOrcamentoWhatsapp}
        onCorrida={irCorrida}
      />
    </main>
  );
}
