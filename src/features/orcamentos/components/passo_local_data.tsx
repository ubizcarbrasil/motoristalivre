import { SecaoEnderecoAtendimento } from "@/features/passageiro/components/secao_endereco_atendimento";
import type { EnderecoAtendimento } from "@/features/servicos/types/tipos_servicos";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OPCOES_URGENCIA } from "../constants/constantes_orcamento";
import { ChipOpcao } from "./chip_opcao";
import type { UrgenciaOrcamento } from "../types/tipos_orcamento";

interface Props {
  endereco: EnderecoAtendimento;
  onEnderecoChange: (proximo: EnderecoAtendimento) => void;
  urgencia: UrgenciaOrcamento;
  onUrgenciaChange: (u: UrgenciaOrcamento) => void;
  dataDesejada: string | null;
  onDataDesejadaChange: (d: string | null) => void;
}

export function PassoLocalData({
  endereco,
  onEnderecoChange,
  urgencia,
  onUrgenciaChange,
  dataDesejada,
  onDataDesejadaChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Onde e quando?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Informe o local do atendimento e a urgência.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Quando precisa?</Label>
        <div className="grid grid-cols-2 gap-2">
          {OPCOES_URGENCIA.map((o) => (
            <ChipOpcao
              key={o.valor}
              rotulo={o.rotulo}
              ativo={urgencia === o.valor}
              onClick={() => onUrgenciaChange(o.valor)}
            />
          ))}
        </div>
        {urgencia === "data_marcada" && (
          <div className="space-y-1.5">
            <Label htmlFor="dt_desejada" className="text-xs text-muted-foreground">
              Data preferida
            </Label>
            <Input
              id="dt_desejada"
              type="datetime-local"
              value={dataDesejada ?? ""}
              onChange={(e) => onDataDesejadaChange(e.target.value || null)}
              className="bg-card border-border"
            />
          </div>
        )}
      </div>

      <SecaoEnderecoAtendimento valor={endereco} onChange={onEnderecoChange} />
    </div>
  );
}
