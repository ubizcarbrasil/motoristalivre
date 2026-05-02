import { CheckCircle2, Clock, ThumbsUp } from "lucide-react";

interface BlocoConfiancaProps {
  isVerified: boolean;
  mesesAtuacao: number;
  taxaAceite: number;
  totalAvaliacoes: number;
}

/**
 * Linha horizontal de "sinais de confiança" estilo iFood:
 * verificado · X meses no app · Y% aceite. Só mostra os sinais que existem.
 */
export function BlocoConfianca({
  isVerified,
  mesesAtuacao,
  taxaAceite,
  totalAvaliacoes,
}: BlocoConfiancaProps) {
  const itens: Array<{ icone: typeof CheckCircle2; texto: string }> = [];

  if (isVerified) {
    itens.push({ icone: CheckCircle2, texto: "Verificado" });
  }
  if (mesesAtuacao >= 1) {
    const txt =
      mesesAtuacao >= 12
        ? `${Math.floor(mesesAtuacao / 12)} ${Math.floor(mesesAtuacao / 12) === 1 ? "ano" : "anos"} no app`
        : `${mesesAtuacao} ${mesesAtuacao === 1 ? "mês" : "meses"} no app`;
    itens.push({ icone: Clock, texto: txt });
  }
  if (totalAvaliacoes > 5 && taxaAceite >= 80) {
    itens.push({ icone: ThumbsUp, texto: `${taxaAceite}% aceite` });
  }

  if (itens.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-5 mt-4">
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {itens.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <item.icone className="w-3.5 h-3.5 text-primary" />
            {item.texto}
          </span>
        ))}
      </div>
    </div>
  );
}
