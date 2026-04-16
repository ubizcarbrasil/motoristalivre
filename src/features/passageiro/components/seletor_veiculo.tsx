import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Bike } from "lucide-react";
import type { PrecoCalculado } from "../types/tipos_passageiro";
import { formatarPreco } from "../utils/utilitarios_passageiro";

interface SeletorVeiculoProps {
  precos: PrecoCalculado[];
  veiculoSelecionado: string;
  onSelecionar: (id: string) => void;
  valorOferta: number;
  onMudarOferta: (valor: number) => void;
  onConfirmar: () => void;
  onVoltar: () => void;
}

function iconeVeiculo(id: string) {
  if (id === "moto") return <Bike className="w-5 h-5" />;
  return <Car className="w-5 h-5" />;
}

export function SeletorVeiculo({
  precos,
  veiculoSelecionado,
  onSelecionar,
  valorOferta,
  onMudarOferta,
  onConfirmar,
  onVoltar,
}: SeletorVeiculoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {precos.map(({ veiculo, preco }) => {
          const selecionado = veiculo.id === veiculoSelecionado;
          return (
            <button
              key={veiculo.id}
              type="button"
              onClick={() => {
                onSelecionar(veiculo.id);
                onMudarOferta(Math.round(preco));
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                selecionado
                  ? "bg-primary/10 border border-primary"
                  : "bg-secondary border border-transparent hover:border-border"
              }`}
            >
              <div className={`${selecionado ? "text-primary" : "text-muted-foreground"}`}>
                {iconeVeiculo(veiculo.id)}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{veiculo.nome}</p>
                <p className="text-xs text-muted-foreground">{veiculo.descricao}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{formatarPreco(preco)}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Sua oferta</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">R$</span>
          <Input
            type="number"
            min={0}
            value={valorOferta}
            onChange={(e) => onMudarOferta(Number(e.target.value))}
            className="bg-secondary border-0 h-11 text-base font-semibold"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} className="flex-1 h-12">
          Voltar
        </Button>
        <Button onClick={onConfirmar} className="flex-1 h-12 font-semibold">
          Confirmar
        </Button>
      </div>
    </div>
  );
}
