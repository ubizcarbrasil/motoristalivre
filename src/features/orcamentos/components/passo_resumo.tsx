import { Button } from "@/components/ui/button";
import type {
  CategoriaServico,
  ContatoOrcamento,
  EnderecoOrcamento,
  PerguntaOrcamento,
  RespostasOrcamento,
  UrgenciaOrcamento,
} from "../types/tipos_orcamento";
import { perguntasVisiveis } from "../utils/utilitario_renderer_pergunta";
import { OPCOES_URGENCIA } from "../constants/constantes_orcamento";

interface Props {
  categoria: CategoriaServico | null;
  perguntas: PerguntaOrcamento[];
  respostas: RespostasOrcamento;
  endereco: EnderecoOrcamento;
  urgencia: UrgenciaOrcamento;
  contato: ContatoOrcamento;
  maxPropostas: number;
  enviando: boolean;
  onEnviar: () => void;
}

function rotuloResposta(p: PerguntaOrcamento, v: RespostasOrcamento[string]): string {
  if (Array.isArray(v)) {
    return v
      .map((x) => p.opcoes?.find((o) => o.valor === x)?.rotulo ?? x)
      .join(", ");
  }
  const s = String(v ?? "");
  return p.opcoes?.find((o) => o.valor === s)?.rotulo ?? s;
}

export function PassoResumo({
  categoria,
  perguntas,
  respostas,
  endereco,
  urgencia,
  contato,
  maxPropostas,
  enviando,
  onEnviar,
}: Props) {
  const visiveis = perguntasVisiveis(perguntas, respostas);
  const rotuloUrg = OPCOES_URGENCIA.find((o) => o.valor === urgencia)?.rotulo ?? urgencia;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Confirmar pedido</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revise os dados antes de enviar.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Categoria</p>
          <p className="text-sm text-foreground font-medium">{categoria?.nome ?? "—"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Detalhes</p>
          {visiveis.map((p) => (
            <div key={p.id} className="flex justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{p.label}</span>
              <span className="text-foreground font-medium text-right">
                {rotuloResposta(p, respostas[p.key]) || "—"}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Local</p>
          <p className="text-sm text-foreground">
            {endereco.logradouro}, {endereco.numero}
            {endereco.complemento ? ` — ${endereco.complemento}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {endereco.bairro} — {endereco.cidade}/{endereco.uf} — {endereco.cep}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Urgência</p>
          <p className="text-sm text-foreground font-medium">{rotuloUrg}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Contato</p>
          <p className="text-sm text-foreground">{contato.nome}</p>
          <p className="text-xs text-muted-foreground">{contato.whatsapp}</p>
          <p className="text-xs text-muted-foreground">
            Receberá até {maxPropostas} {maxPropostas === 1 ? "proposta" : "propostas"}.
          </p>
        </div>
      </div>

      <Button
        onClick={onEnviar}
        disabled={enviando}
        className="w-full h-12 text-base font-semibold"
      >
        {enviando ? "Enviando..." : "Solicitar orçamentos"}
      </Button>
    </div>
  );
}
