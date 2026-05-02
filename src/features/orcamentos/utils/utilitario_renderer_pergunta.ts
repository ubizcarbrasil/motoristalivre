import type { PerguntaCondicional, PerguntaOrcamento, RespostasOrcamento } from "../types/tipos_orcamento";

/**
 * Avalia condicional simples para decidir se uma pergunta deve ser exibida.
 */
export function avaliarCondicional(
  condicional: PerguntaCondicional | null | undefined,
  respostas: RespostasOrcamento,
): boolean {
  if (!condicional) return true;
  const valor = respostas[condicional.campo];
  const norm = Array.isArray(valor) ? valor.map(String) : [String(valor ?? "")];
  if (condicional.igual !== undefined) return norm.includes(condicional.igual);
  if (condicional.diferente !== undefined) return !norm.includes(condicional.diferente);
  return true;
}

export function perguntasVisiveis(
  perguntas: PerguntaOrcamento[],
  respostas: RespostasOrcamento,
): PerguntaOrcamento[] {
  return perguntas
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .filter((p) => avaliarCondicional(p.condicional, respostas));
}

export function validarRespostasObrigatorias(
  perguntas: PerguntaOrcamento[],
  respostas: RespostasOrcamento,
): { ok: boolean; faltando: string[] } {
  const visiveis = perguntasVisiveis(perguntas, respostas);
  const faltando: string[] = [];
  for (const p of visiveis) {
    if (!p.obrigatorio) continue;
    const v = respostas[p.key];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
      faltando.push(p.label);
    }
  }
  return { ok: faltando.length === 0, faltando };
}
