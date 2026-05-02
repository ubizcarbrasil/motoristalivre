import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OPCOES_MAX_PROPOSTAS } from "../constants/constantes_orcamento";
import { ChipOpcao } from "./chip_opcao";
import type { ContatoOrcamento } from "../types/tipos_orcamento";

interface Props {
  contato: ContatoOrcamento;
  onContatoChange: (c: ContatoOrcamento) => void;
  maxPropostas: number;
  onMaxPropostasChange: (n: number) => void;
  observacao: string;
  onObservacaoChange: (s: string) => void;
}

export function PassoContato({
  contato,
  onContatoChange,
  maxPropostas,
  onMaxPropostasChange,
  observacao,
  onObservacaoChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Seu contato</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Os profissionais usam para enviar a proposta.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ct_nome">Nome</Label>
          <Input
            id="ct_nome"
            value={contato.nome}
            onChange={(e) => onContatoChange({ ...contato, nome: e.target.value })}
            maxLength={120}
            className="bg-card border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ct_wpp">WhatsApp</Label>
          <Input
            id="ct_wpp"
            value={contato.whatsapp}
            onChange={(e) => onContatoChange({ ...contato, whatsapp: e.target.value })}
            placeholder="(11) 90000-0000"
            inputMode="tel"
            maxLength={20}
            className="bg-card border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Quantos profissionais quer receber?
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {OPCOES_MAX_PROPOSTAS.map((o) => (
            <ChipOpcao
              key={o.valor}
              rotulo={o.rotulo}
              ativo={maxPropostas === o.valor}
              onClick={() => onMaxPropostasChange(o.valor)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ct_obs">Observação (opcional)</Label>
        <textarea
          id="ct_obs"
          value={observacao}
          onChange={(e) => onObservacaoChange(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full bg-card border border-border rounded-lg p-3 text-sm resize-none"
          placeholder="Algum detalhe extra?"
        />
      </div>
    </div>
  );
}
