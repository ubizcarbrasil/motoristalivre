import { Button } from "@/components/ui/button";
import { CHAVE_PIX_SIMULADA, PLANOS } from "../constants/constantes_onboarding";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EtapaPagamentoProps {
  planoSelecionado: string;
  onConfirmar: () => void;
  onVoltar: () => void;
}

export function EtapaPagamento({ planoSelecionado, onConfirmar, onVoltar }: EtapaPagamentoProps) {
  const [copiado, setCopiado] = useState(false);
  const plano = PLANOS.find((p) => p.id === planoSelecionado);

  const copiarChave = async () => {
    await navigator.clipboard.writeText(CHAVE_PIX_SIMULADA);
    setCopiado(true);
    toast.success("Chave PIX copiada");
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Pagamento</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Realize o pagamento via PIX para ativar seu plano.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Plano</span>
          <span className="text-sm font-medium text-foreground">{plano?.nome}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Valor</span>
          <span className="text-lg font-bold text-foreground">
            R${plano?.precoMensal.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm text-muted-foreground">Chave PIX</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-secondary rounded-lg px-3 py-2 text-foreground truncate">
            {CHAVE_PIX_SIMULADA}
          </code>
          <Button variant="outline" size="icon" onClick={copiarChave}>
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* QR Code simulado */}
        <div className="flex justify-center py-4">
          <div className="w-48 h-48 bg-secondary rounded-xl flex items-center justify-center border border-border">
            <div className="grid grid-cols-8 gap-[2px] w-36 h-36">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-[1px] ${
                    Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} className="flex-1">
          Voltar
        </Button>
        <Button onClick={onConfirmar} className="flex-1">
          Já realizei o pagamento
        </Button>
      </div>
    </div>
  );
}
