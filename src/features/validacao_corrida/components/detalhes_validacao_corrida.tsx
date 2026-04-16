import { Calendar, Car, MapPin, User, Wallet } from "lucide-react";
import type { CorridaValidacao } from "../types/tipos_validacao_corrida";
import {
  formatarDataValidacao,
  formatarPagamentoValidacao,
  formatarValorValidacao,
} from "../utils/utilitarios_validacao_corrida";

interface DetalhesValidacaoCorridaProps {
  corrida: CorridaValidacao;
  cor: string;
}

interface LinhaProps {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
}

function Linha({ icone, rotulo, valor }: LinhaProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
        {icone}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {rotulo}
        </p>
        <p className="text-sm text-foreground font-medium break-words">
          {valor}
        </p>
      </div>
    </div>
  );
}

export function DetalhesValidacaoCorrida({
  corrida,
  cor,
}: DetalhesValidacaoCorridaProps) {
  const veiculo = [corrida.veiculo_modelo, corrida.veiculo_cor]
    .filter(Boolean)
    .join(" • ");
  const veiculoCompleto = corrida.veiculo_placa
    ? `${veiculo || "Veículo"} (${corrida.veiculo_placa})`
    : veiculo || "—";

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="px-4 py-3 border-b border-border"
        style={{ backgroundColor: `${cor}10` }}
      >
        <p className="text-xs text-muted-foreground">Valor da corrida</p>
        <p className="text-2xl font-bold" style={{ color: cor }}>
          {formatarValorValidacao(corrida.valor)}
        </p>
      </div>

      <div className="px-4">
        <Linha
          icone={<Calendar className="w-4 h-4 text-muted-foreground" />}
          rotulo="Data e hora"
          valor={formatarDataValidacao(corrida.data_iso)}
        />
        <Linha
          icone={<User className="w-4 h-4 text-muted-foreground" />}
          rotulo="Motorista"
          valor={corrida.motorista_nome ?? "Não informado"}
        />
        <Linha
          icone={<Car className="w-4 h-4 text-muted-foreground" />}
          rotulo="Veículo"
          valor={veiculoCompleto}
        />
        <Linha
          icone={<MapPin className="w-4 h-4 text-muted-foreground" />}
          rotulo="Origem"
          valor={corrida.origem ?? "—"}
        />
        <Linha
          icone={<MapPin className="w-4 h-4" style={{ color: cor }} />}
          rotulo="Destino"
          valor={corrida.destino ?? "—"}
        />
        <Linha
          icone={<Wallet className="w-4 h-4 text-muted-foreground" />}
          rotulo="Pagamento"
          valor={formatarPagamentoValidacao(corrida.pagamento)}
        />
      </div>
    </section>
  );
}
