import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Loader2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePerfilMotorista } from "../hooks/hook_perfil_motorista";
import { SecaoBio } from "../components/secao_bio";
import { SecaoServicosPublica } from "../components/secao_servicos_publica";
import { SecaoEquipePublica } from "../components/secao_equipe_publica";
import { VitrineEspecialidades } from "@/compartilhados/components/vitrine_especialidades";
import { imagemDeCapa } from "@/compartilhados/utils/imagens_categorias";
import { nomePorSlug } from "@/compartilhados/constants/constantes_categorias_servico";

export default function PaginaPerfilMotorista() {
  const navigate = useNavigate();
  const {
    perfil,
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
  const inicial = perfil.nome.charAt(0).toUpperCase();
  const categoriasTopo = perfil.service_categories.slice(0, 5);

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
      {/* Botões flutuantes sobre a cover */}
      <div className="fixed top-3 inset-x-0 z-30 flex items-center justify-between px-3 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground shadow-lg"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={compartilhar}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground shadow-lg"
          aria-label="Compartilhar"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Cover */}
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-secondary">
        <img
          src={coverUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Identidade */}
      <section className="max-w-3xl mx-auto px-4 -mt-12 relative">
        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-background shadow-xl">
          <AvatarImage src={perfil.avatar_url ?? undefined} alt={perfil.nome} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {inicial}
          </AvatarFallback>
        </Avatar>

        <div className="mt-3 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground leading-tight">
            {perfil.nome}
          </h1>
          {perfil.tenant_nome && (
            <p className="text-sm text-muted-foreground">{perfil.tenant_nome}</p>
          )}
          {categoriasTopo.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categoriasTopo.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {nomePorSlug(cat)}
                </Badge>
              ))}
              {perfil.service_categories.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{perfil.service_categories.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 space-y-6">
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

      {/* Bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur p-4">
        <div className="max-w-3xl mx-auto">
          {perfil.professional_type === "both" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-12" onClick={irCorrida}>
                Solicitar corrida
              </Button>
              <Button className="h-12 gap-2" onClick={irAgendar}>
                <CalendarPlus className="w-4 h-4" />
                Agendar
              </Button>
            </div>
          ) : ofereceServico ? (
            temServicosVendaveis ? (
              <Button size="lg" className="w-full gap-2" onClick={irAgendar}>
                <CalendarPlus className="w-4 h-4" />
                Agendar agora
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!perfil.whatsapp}
                onClick={abrirOrcamentoWhatsapp}
              >
                <MessageCircle className="w-4 h-4" />
                {perfil.whatsapp ? "Solicitar orçamento" : "WhatsApp não cadastrado"}
              </Button>
            )
          ) : ofereceCorrida ? (
            <Button size="lg" className="w-full" onClick={irCorrida}>
              Solicitar corrida
            </Button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
