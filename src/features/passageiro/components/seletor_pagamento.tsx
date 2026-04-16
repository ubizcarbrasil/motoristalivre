import { Banknote, CreditCard, QrCode, Wallet } from "lucide-react";
import { FORMAS_PAGAMENTO } from "../constants/constantes_passageiro";
import type { FormaPagamento } from "../types/tipos_passageiro";

interface SeletorPagamentoProps {
  selecionado: FormaPagamento;
  onSelecionar: (forma: FormaPagamento) => void;
}

function iconePagamento(id: FormaPagamento) {
  const cls = "w-4 h-4";
  switch (id) {
    case "dinheiro": return <Banknote className={cls} />;
    case "pix": return <QrCode className={cls} />;
    case "cartao": return <CreditCard className={cls} />;
    case "saldo": return <Wallet className={cls} />;
  }
}

export function SeletorPagamento({ selecionado, onSelecionar }: SeletorPagamentoProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Forma de pagamento</label>
      <div className="grid grid-cols-4 gap-2">
        {FORMAS_PAGAMENTO.map((forma) => {
          const ativo = forma.id === selecionado;
          return (
            <button
              key={forma.id}
              type="button"
              onClick={() => onSelecionar(forma.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-3 px-2 transition-all ${
                ativo
                  ? "bg-primary/15 border border-primary text-primary"
                  : "bg-secondary border border-transparent text-muted-foreground hover:border-border"
              }`}
            >
              {iconePagamento(forma.id)}
              <span className="text-[11px] font-medium">{forma.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
