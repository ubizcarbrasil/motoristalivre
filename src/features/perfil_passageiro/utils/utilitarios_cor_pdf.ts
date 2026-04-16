/**
 * Converte cor hexadecimal (#rgb ou #rrggbb) para tupla [r, g, b].
 * Retorna verde TriboCar como fallback caso o formato seja inválido.
 */
export function hexParaRgb(hex: string): [number, number, number] {
  const padrao: [number, number, number] = [29, 184, 101];
  if (!hex) return padrao;

  let limpo = hex.trim().replace("#", "");
  if (limpo.length === 3) {
    limpo = limpo
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) return padrao;

  return [
    parseInt(limpo.slice(0, 2), 16),
    parseInt(limpo.slice(2, 4), 16),
    parseInt(limpo.slice(4, 6), 16),
  ];
}

/**
 * Mistura uma cor RGB com branco gerando uma versão suave (para fundos).
 * fator = 0 (cor pura) → 1 (branco puro).
 */
export function clarearRgb(
  rgb: [number, number, number],
  fator: number
): [number, number, number] {
  const f = Math.max(0, Math.min(1, fator));
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * f),
    Math.round(rgb[1] + (255 - rgb[1]) * f),
    Math.round(rgb[2] + (255 - rgb[2]) * f),
  ];
}
