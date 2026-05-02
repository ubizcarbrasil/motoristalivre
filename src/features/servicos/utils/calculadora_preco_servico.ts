// Calculadora de preço para serviços com fatores dinâmicos.
// Usada tanto no front (preview em tempo real) quanto no servidor (recálculo seguro).

export interface FatorPrecoServico {
  id: string;
  key: string;
  label: string;
  input_type: "number" | "select";
  unit?: string | null;
  options?: Array<{ valor: string; rotulo: string; multiplicador?: number; acrescimo?: number }> | null;
  unit_price: number;
  min_value?: number | null;
  max_value?: number | null;
  step?: number | null;
  default_value?: number | null;
  required?: boolean;
  ordem?: number;
}

export interface ConfigDeslocamento {
  travel_fee_base?: number | null;
  travel_fee_per_km?: number | null;
  service_radius_km?: number | null;
}

export interface EntradaCalculo {
  preco_base: number;
  fatores: FatorPrecoServico[];
  valores_fatores: Record<string, string | number | undefined>;
  distancia_km?: number | null;
  config_deslocamento?: ConfigDeslocamento;
}

export interface LinhaCalculo {
  rotulo: string;
  valor: number;
}

export interface ResultadoCalculo {
  base: number;
  linhas_fatores: LinhaCalculo[];
  travel_fee: number;
  total: number;
  fora_do_raio: boolean;
}

export function calcularPrecoServico(input: EntradaCalculo): ResultadoCalculo {
  const linhas_fatores: LinhaCalculo[] = [];
  const base = Number(input.preco_base) || 0;

  for (const f of input.fatores) {
    const v = input.valores_fatores[f.key];
    if (v === undefined || v === null || v === "") continue;

    if (f.input_type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) continue;
      const valor = n * (Number(f.unit_price) || 0);
      if (valor !== 0) {
        linhas_fatores.push({
          rotulo: `${f.label}: ${n}${f.unit ? ` ${f.unit}` : ""}`,
          valor,
        });
      }
    } else if (f.input_type === "select" && f.options) {
      const op = f.options.find((o) => o.valor === String(v));
      if (!op) continue;
      const valor = Number(op.acrescimo) || 0;
      const mult = Number(op.multiplicador);
      if (Number.isFinite(mult) && mult !== 0 && mult !== 1) {
        const acrescimoMult = base * (mult - 1);
        if (acrescimoMult !== 0) {
          linhas_fatores.push({
            rotulo: `${f.label}: ${op.rotulo} (×${mult})`,
            valor: acrescimoMult,
          });
        }
      }
      if (valor !== 0) {
        linhas_fatores.push({
          rotulo: `${f.label}: ${op.rotulo}`,
          valor,
        });
      }
    }
  }

  let travel_fee = 0;
  let fora_do_raio = false;
  const cfg = input.config_deslocamento;
  if (cfg && (cfg.travel_fee_base || cfg.travel_fee_per_km)) {
    travel_fee = Number(cfg.travel_fee_base) || 0;
    if (input.distancia_km && cfg.travel_fee_per_km) {
      travel_fee += input.distancia_km * Number(cfg.travel_fee_per_km);
    }
  }
  if (cfg?.service_radius_km && input.distancia_km && input.distancia_km > cfg.service_radius_km) {
    fora_do_raio = true;
  }

  const total =
    base +
    linhas_fatores.reduce((acc, l) => acc + l.valor, 0) +
    travel_fee;

  return {
    base,
    linhas_fatores,
    travel_fee: Math.round(travel_fee * 100) / 100,
    total: Math.round(total * 100) / 100,
    fora_do_raio,
  };
}

export function validarFatoresObrigatorios(
  fatores: FatorPrecoServico[],
  valores: Record<string, string | number | undefined>,
): string | null {
  for (const f of fatores) {
    if (!f.required) continue;
    const v = valores[f.key];
    if (v === undefined || v === null || v === "") {
      return `Informe: ${f.label}`;
    }
  }
  return null;
}
