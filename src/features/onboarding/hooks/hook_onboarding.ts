import { useState, useCallback } from "react";
import type {
  DadosIdentidade,
  DadosConfiguracao,
  DadosServico,
  EtapaOnboarding,
  ModuloPlataforma,
} from "../types/tipos_onboarding";
import { IDENTIDADE_INICIAL, CONFIGURACAO_INICIAL } from "../constants/constantes_onboarding";

const ETAPA_FINAL: EtapaOnboarding = 5;

export function useOnboarding() {
  const [etapaAtual, setEtapaAtual] = useState<EtapaOnboarding>(0);
  const [identidade, setIdentidade] = useState<DadosIdentidade>(IDENTIDADE_INICIAL);
  const [modulosSelecionados, setModulosSelecionados] = useState<ModuloPlataforma[]>(["mobility"]);
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [configuracao, setConfiguracao] = useState<DadosConfiguracao>(CONFIGURACAO_INICIAL);
  const [servicos, setServicos] = useState<DadosServico[]>([]);
  const [enviando, setEnviando] = useState(false);

  const avancar = useCallback(() => {
    setEtapaAtual((prev) => Math.min(prev + 1, ETAPA_FINAL) as EtapaOnboarding);
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
    modulosSelecionados,
    setModulosSelecionados,
    planoSelecionado,
    setPlanoSelecionado,
    pagamentoConfirmado,
    setPagamentoConfirmado,
    configuracao,
    setConfiguracao,
    servicos,
    setServicos,
    enviando,
    setEnviando,
    avancar,
    voltar,
    irParaEtapa,
  };
}
