/**
 * Formata data ISO para exibição em pt-BR.
 */
export function formatarDataValidacao(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata valor monetário em R$.
 */
export function formatarValorValidacao(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

/**
 * Formata método de pagamento em label legível.
 */
export function formatarPagamentoValidacao(p: string): string {
  const map: Record<string, string> = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    cartao: "Cartão",
    saldo: "Saldo",
  };
  return map[p] ?? p;
}
