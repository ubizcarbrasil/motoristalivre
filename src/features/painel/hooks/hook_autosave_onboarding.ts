import { useCallback, useEffect, useRef, useState } from "react";
import {
  salvarRascunhoOnboarding,
  type RascunhoOnboarding,
} from "../services/servico_autosave_onboarding";

const DEBOUNCE_MS = 800;

export type StatusAutoSave = "idle" | "salvando" | "salvo" | "erro";

interface ParametrosHook {
  driverId: string;
  tenantId: string;
  dados: RascunhoOnboarding;
  ativo: boolean;
}

interface RetornoHook {
  status: StatusAutoSave;
  ultimoErro: string | null;
}

/**
 * Observa o objeto `dados` e dispara um salvamento parcial (debounce) sempre
 * que ele muda. Pula a primeira renderização para não regravar dados que
 * acabaram de chegar do servidor.
 */
export function useHookAutoSaveOnboarding({
  driverId,
  tenantId,
  dados,
  ativo,
}: ParametrosHook): RetornoHook {
  const [status, setStatus] = useState<StatusAutoSave>("idle");
  const [ultimoErro, setUltimoErro] = useState<string | null>(null);
  const primeiraExecucaoRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dadosRef = useRef(dados);
  dadosRef.current = dados;

  const executarSalvamento = useCallback(async () => {
    if (!driverId || !tenantId) return;
    setStatus("salvando");
    setUltimoErro(null);
    try {
      await salvarRascunhoOnboarding(driverId, tenantId, dadosRef.current);
      setStatus("salvo");
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro ao salvar";
      setUltimoErro(mensagem);
      setStatus("erro");
    }
  }, [driverId, tenantId]);

  useEffect(() => {
    if (!ativo) return;
    if (primeiraExecucaoRef.current) {
      primeiraExecucaoRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void executarSalvamento();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dados), ativo, executarSalvamento]);

  // Reseta a flag quando o hook é desativado para retomar limpo
  useEffect(() => {
    if (!ativo) {
      primeiraExecucaoRef.current = true;
      setStatus("idle");
    }
  }, [ativo]);

  return { status, ultimoErro };
}
