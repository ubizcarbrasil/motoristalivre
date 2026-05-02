import { useEffect, useRef, useState } from "react";
import type {
  ContatoOrcamento,
  RespostasOrcamento,
  UrgenciaOrcamento,
} from "../types/tipos_orcamento";
import type { EnderecoAtendimento } from "@/features/servicos/types/tipos_servicos";

export interface RascunhoOrcamento {
  categoriaId: string | null;
  respostas: RespostasOrcamento;
  endereco: EnderecoAtendimento;
  urgencia: UrgenciaOrcamento;
  dataDesejada: string | null;
  contato: ContatoOrcamento;
  maxPropostas: number;
  observacao: string;
  passo: number;
  atualizadoEm: number;
}

const PREFIXO = "tribocar:orcamento:rascunho";
const VALIDADE_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

const chave = (tenantId: string | null | undefined): string =>
  `${PREFIXO}:${tenantId ?? "default"}`;

export function carregarRascunho(tenantId: string | null | undefined): RascunhoOrcamento | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(chave(tenantId));
    if (!raw) return null;
    const dados = JSON.parse(raw) as RascunhoOrcamento;
    if (!dados?.atualizadoEm || Date.now() - dados.atualizadoEm > VALIDADE_MS) {
      window.localStorage.removeItem(chave(tenantId));
      return null;
    }
    return dados;
  } catch {
    return null;
  }
}

export function limparRascunho(tenantId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(chave(tenantId));
  } catch {
    /* noop */
  }
}

export function salvarRascunho(
  tenantId: string | null | undefined,
  dados: Omit<RascunhoOrcamento, "atualizadoEm">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: RascunhoOrcamento = { ...dados, atualizadoEm: Date.now() };
    window.localStorage.setItem(chave(tenantId), JSON.stringify(payload));
  } catch {
    /* noop */
  }
}

interface UsarRascunhoArgs {
  tenantId: string | null | undefined;
  dados: Omit<RascunhoOrcamento, "atualizadoEm">;
  habilitado: boolean;
}

export function useAutoSalvarRascunho({ tenantId, dados, habilitado }: UsarRascunhoArgs) {
  const [salvoEm, setSalvoEm] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!habilitado) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      salvarRascunho(tenantId, dados);
      setSalvoEm(Date.now());
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [tenantId, habilitado, dados]);

  return { salvoEm };
}
