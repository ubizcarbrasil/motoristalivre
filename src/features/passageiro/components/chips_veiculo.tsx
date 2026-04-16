import type { MotoristaCorrida } from "../types/tipos_passageiro";

interface ChipsVeiculoProps {
  veiculo: MotoristaCorrida["veiculo"];
}

function Chip({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex-1 rounded-xl bg-secondary px-3 py-2 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-foreground truncate">{valor}</p>
    </div>
  );
}

export function ChipsVeiculo({ veiculo }: ChipsVeiculoProps) {
  return (
    <div className="flex gap-2">
      <Chip label="Modelo" valor={veiculo.modelo ?? "—"} />
      <Chip label="Ano" valor={veiculo.ano?.toString() ?? "—"} />
      <Chip label="Cor" valor={veiculo.cor ?? "—"} />
      <Chip label="Placa" valor={veiculo.placa ?? "—"} />
    </div>
  );
}
