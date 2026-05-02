import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PerguntaOrcamento, RespostasOrcamento } from "../types/tipos_orcamento";
import { perguntasVisiveis } from "../utils/utilitario_renderer_pergunta";
import { ChipOpcao } from "./chip_opcao";

interface Props {
  perguntas: PerguntaOrcamento[];
  respostas: RespostasOrcamento;
  onChange: (proximas: RespostasOrcamento) => void;
}

export function PassoPerguntas({ perguntas, respostas, onChange }: Props) {
  const visiveis = perguntasVisiveis(perguntas, respostas);

  const setResposta = (key: string, valor: RespostasOrcamento[string]) => {
    onChange({ ...respostas, [key]: valor });
  };

  const toggleMulti = (key: string, opcao: string) => {
    const atual = (respostas[key] as string[] | undefined) ?? [];
    const proximo = atual.includes(opcao) ? atual.filter((v) => v !== opcao) : [...atual, opcao];
    setResposta(key, proximo);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Detalhes do serviço</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Responda as perguntas para receber propostas precisas.
        </p>
      </div>

      <div className="space-y-5">
        {visiveis.map((p) => {
          const obrig = p.obrigatorio ? <span className="text-primary"> *</span> : null;
          return (
            <div key={p.id} className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                {p.label}
                {obrig}
              </Label>
              {p.ajuda && <p className="text-xs text-muted-foreground">{p.ajuda}</p>}

              {(p.tipo === "single_select" || p.tipo === "number_chips") && (
                <div className="grid grid-cols-2 gap-2">
                  {(p.opcoes ?? []).map((o) => (
                    <ChipOpcao
                      key={o.valor}
                      rotulo={o.rotulo}
                      ativo={String(respostas[p.key] ?? "") === o.valor}
                      onClick={() => setResposta(p.key, o.valor)}
                    />
                  ))}
                </div>
              )}

              {p.tipo === "multi_select" && (
                <div className="grid grid-cols-2 gap-2">
                  {(p.opcoes ?? []).map((o) => {
                    const atual = (respostas[p.key] as string[] | undefined) ?? [];
                    return (
                      <ChipOpcao
                        key={o.valor}
                        rotulo={o.rotulo}
                        ativo={atual.includes(o.valor)}
                        onClick={() => toggleMulti(p.key, o.valor)}
                      />
                    );
                  })}
                </div>
              )}

              {p.tipo === "date_chips" && (
                <Input
                  type="date"
                  value={String(respostas[p.key] ?? "")}
                  onChange={(e) => setResposta(p.key, e.target.value)}
                  className="bg-card border-border"
                />
              )}

              {p.tipo === "text_short" && (
                <Textarea
                  value={String(respostas[p.key] ?? "")}
                  onChange={(e) => setResposta(p.key, e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="bg-card border-border resize-none"
                  placeholder="Descreva resumidamente"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
