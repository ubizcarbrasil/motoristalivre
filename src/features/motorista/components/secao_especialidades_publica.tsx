import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  iconePorSlug,
  nomePorSlug,
} from "@/compartilhados/constants/constantes_categorias_servico";

interface Props {
  categorias: string[];
  nomeProfissional: string;
  whatsapp: string | null;
}

function montarLinkWhatsapp(whatsapp: string, mensagem: string): string {
  const numero = whatsapp.replace(/\D/g, "");
  const completo = numero.length <= 11 ? `55${numero}` : numero;
  return `https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Fallback exibido quando o profissional ainda não cadastrou serviços
 * vendáveis (com preço e duração), mas tem especialidades selecionadas.
 *
 * Mostra as especialidades como cards e oferece um CTA de orçamento
 * via WhatsApp, evitando que a página fique inutilizável para o cliente.
 */
export function SecaoEspecialidadesPublica({
  categorias,
  nomeProfissional,
  whatsapp,
}: Props) {
  if (!categorias || categorias.length === 0) return null;

  const solicitarOrcamento = (especialidade?: string) => {
    if (!whatsapp) return;
    const mensagemBase = `Olá ${nomeProfissional}, vim pelo TriboServiços`;
    const mensagem = especialidade
      ? `${mensagemBase} e gostaria de um orçamento para *${especialidade}*.`
      : `${mensagemBase} e gostaria de solicitar um orçamento.`;
    window.open(montarLinkWhatsapp(whatsapp, mensagem), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Solicite um orçamento</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Toque em uma especialidade para conversar diretamente com o profissional.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {categorias.map((slug) => {
          const Icone = iconePorSlug(slug);
          const nome = nomePorSlug(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => solicitarOrcamento(nome)}
              disabled={!whatsapp}
              className="flex items-center gap-2 rounded-xl bg-card border border-border p-3 text-left transition-colors hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Icone className="w-4 h-4 text-primary" />
              </span>
              <span className="text-xs font-medium text-foreground line-clamp-2">{nome}</span>
            </button>
          );
        })}
      </div>
      {whatsapp ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={() => solicitarOrcamento()}
        >
          <MessageCircle className="w-4 h-4" />
          Pedir orçamento geral
        </Button>
      ) : (
        <p className="text-[11px] text-muted-foreground text-center">
          Este profissional ainda não cadastrou um WhatsApp para contato direto.
        </p>
      )}
    </div>
  );
}
