import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  nomePorSlug,
  CATEGORIAS_SERVICO,
} from "@/compartilhados/constants/constantes_categorias_servico";
import { imagemParaCategoria } from "@/compartilhados/utils/imagens_categorias";

interface Props {
  categorias: string[];
  nomeProfissional: string;
  whatsapp: string | null;
  titulo?: string;
}

function ordenar(categorias: string[]): string[] {
  const ordem = new Map(CATEGORIAS_SERVICO.map((c, i) => [c.slug, i]));
  return [...categorias].sort(
    (a, b) => (ordem.get(a) ?? 999) - (ordem.get(b) ?? 999),
  );
}

function montarLinkWhatsapp(whatsapp: string, mensagem: string): string {
  const numero = whatsapp.replace(/\D/g, "");
  const completo = numero.length <= 11 ? `55${numero}` : numero;
  return `https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Vitrine visual de especialidades — estilo "app de serviço".
 * Cards com foto Unsplash por categoria + tap → WhatsApp com a especialidade
 * pré-preenchida na mensagem. Usado tanto em /@handle quanto em /s/:slug/:driver.
 */
export function VitrineEspecialidades({
  categorias,
  nomeProfissional,
  whatsapp,
  titulo = "Serviços oferecidos",
}: Props) {
  const ordenadas = ordenar(categorias);
  if (ordenadas.length === 0) return null;

  const solicitarOrcamento = (especialidade?: string) => {
    if (!whatsapp) return;
    const base = `Olá ${nomeProfissional}, vim pelo TriboServiços`;
    const msg = especialidade
      ? `${base} e gostaria de um orçamento para *${especialidade}*.`
      : `${base} e gostaria de solicitar um orçamento.`;
    window.open(
      montarLinkWhatsapp(whatsapp, msg),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="max-w-3xl mx-auto px-4 mt-6 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Toque em um serviço para solicitar orçamento direto pelo WhatsApp.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ordenadas.map((slug) => {
          const nome = nomePorSlug(slug);
          const imagem = imagemParaCategoria(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => solicitarOrcamento(nome)}
              disabled={!whatsapp}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card text-left transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={imagem}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <span className="block text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {nome}
                </span>
                {whatsapp && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                    <MessageCircle className="w-3 h-3" />
                    Pedir orçamento
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {whatsapp ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-2 mt-2"
          onClick={() => solicitarOrcamento()}
        >
          <MessageCircle className="w-4 h-4" />
          Pedir orçamento geral
        </Button>
      ) : (
        <p className="text-[11px] text-muted-foreground text-center pt-1">
          Este profissional ainda não cadastrou um WhatsApp para contato direto.
        </p>
      )}
    </section>
  );
}
