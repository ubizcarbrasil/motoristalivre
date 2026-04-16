import { useState, useCallback } from "react";
import type { DadosIdentidade, DadosConfiguracao, EtapaOnboarding } from "../types/tipos_onboarding";
import { IDENTIDADE_INICIAL, CONFIGURACAO_INICIAL } from "../constants/constantes_onboarding";

export function useOnboarding() {
  const [etapaAtual, setEtapaAtual] = useState<EtapaOnboarding>(0);
  const [identidade, setIdentidade] = useState<DadosIdentidade>(IDENTIDADE_INICIAL);
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [configuracao, setConfiguracao] = useState<DadosConfiguracao>(CONFIGURACAO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  const avancar = useCallback(() => {
    setEtapaAtual((prev) => Math.min(prev + 1, 4) as EtapaOnboarding);
  }, []);

  const voltar = useCallback(() => {
    setEtapaAtual((prev) => Math.max(prev - 1, 0) as EtapaOnboarding);
  }, []);

  const irParaEtapa = useCallback((etapa: EtapaOnboarding) => {
    setEtapaAtual(etapa);
  }, []);

  return {
    etapaAtual,
    identidade,
    setIdentidade,
    planoSelecionado,
    setPlanoSelecionado,
    pagamentoConfirmado,
    setPagamentoConfirmado,
    configuracao,
    setConfiguracao,
    enviando,
    setEnviando,
    avancar,
    voltar,
    irParaEtapa,
  };
}
