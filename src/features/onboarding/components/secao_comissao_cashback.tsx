import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DadosConfiguracao } from "../types/tipos_onboarding";

interface SecaoComissaoCashbackProps {
  dados: DadosConfiguracao;
  onChange: (dados: DadosConfiguracao) => void;
}

export function SecaoComissaoCashback({ dados, onChange }: SecaoComissaoCashbackProps) {
  const atualizar = <K extends keyof DadosConfiguracao>(campo: K, valor: DadosConfiguracao[K]) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Comissões e fidelidade</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Aplicam-se à plataforma como um todo.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comissao">Comissão de transbordo (%)</Label>
        <Input
          id="comissao"
          type="number"
          min={0}
          max={50}
          value={dados.comissaoTransbordo}
          onChange={(e) => atualizar("comissaoTransbordo", Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cashback">Cashback padrão (%)</Label>
        <Input
          id="cashback"
          type="number"
          min={0}
          max={30}
          value={dados.cashbackPadrao}
          onChange={(e) => atualizar("cashbackPadrao", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
