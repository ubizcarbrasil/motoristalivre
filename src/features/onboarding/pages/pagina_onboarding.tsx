import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { LayoutBase } from "@/compartilhados/components/layout_base";
import { TemaServicos } from "@/features/triboservicos/components/tema_servicos";
import { LogoTriboServicos } from "@/features/triboservicos/components/logo_triboservicos";
import { IndicadorProgresso } from "../components/indicador_progresso";
import { EtapaIdentidade } from "../components/etapa_identidade";
import { EtapaModulos } from "../components/etapa_modulos";
import { EtapaPlano } from "../components/etapa_plano";
import { EtapaPagamento } from "../components/etapa_pagamento";
import { EtapaConfiguracao } from "../components/etapa_configuracao";
import { EtapaConvites } from "../components/etapa_convites";
import { useOnboarding } from "../hooks/hook_onboarding";
import { criarGrupo } from "../services/servico_onboarding";
import type { EtapaOnboarding, ModuloPlataforma } from "../types/tipos_onboarding";

export default function PaginaOnboarding() {
  const navegar = useNavigate();
  const [searchParams] = useSearchParams();

  const fluxoSolo = searchParams.get("fluxo") === "solo";
  const moduloUrl = searchParams.get("modulo");

  const {
    etapaAtual,
    identidade,
    setIdentidade,
    modulosSelecionados,
    setModulosSelecionados,
    planoSelecionado,
    setPlanoSelecionado,
    configuracao,
    setConfiguracao,
    servicos,
    setServicos,
    enviando,
    setEnviando,
    irParaEtapa,
    setPagamentoConfirmado,
  } = useOnboarding();

  // Etapas habilitadas (em ordem de exibição). Solo pula Módulos (1) e Convites (5).
  const etapasHabilitadas = useMemo<EtapaOnboarding[]>(() => {
    if (fluxoSolo) return [0, 2, 3, 4];
    return [0, 1, 2, 3, 4, 5];
  }, [fluxoSolo]);

  const indiceVisivel = etapasHabilitadas.indexOf(etapaAtual);

  // Pré-seleciona o módulo Serviços quando vier da landing TriboServiços
  useEffect(() => {
    if (fluxoSolo || moduloUrl === "services") {
      setModulosSelecionados((prev) => {
        const ja = prev.includes("services");
        if (fluxoSolo) return ["services"] as ModuloPlataforma[];
        return ja ? prev : ([...prev.filter((m) => m !== "mobility"), "services"] as ModuloPlataforma[]);
      });
    }
  }, [fluxoSolo, moduloUrl, setModulosSelecionados]);

  const avancarFluxo = () => {
    const proximoIndice = indiceVisivel + 1;
    if (proximoIndice < etapasHabilitadas.length) {
      irParaEtapa(etapasHabilitadas[proximoIndice]);
    }
  };

  const voltarFluxo = () => {
    const anteriorIndice = indiceVisivel - 1;
    if (anteriorIndice >= 0) {
      irParaEtapa(etapasHabilitadas[anteriorIndice]);
    }
  };

  const ultimaEtapa = etapasHabilitadas[etapasHabilitadas.length - 1];
  const naUltima = etapaAtual === ultimaEtapa;

  const finalizar = async () => {
    setEnviando(true);
    try {
      await criarGrupo({
        identidade,
        modulos: modulosSelecionados,
        planoId: planoSelecionado,
        configuracao,
        servicos,
      });
      toast.success("Tudo pronto!");
      window.location.href = fluxoSolo ? "/painel" : "/admin";
    } catch (erro) {
      console.error(erro);
      toast.error("Erro ao concluir. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  // Quando solo, a "última etapa" é a Configuração (4): finaliza direto sem passar por Convites
  const acaoAvancarConfiguracao = fluxoSolo && etapaAtual === 4 ? finalizar : avancarFluxo;

  const conteudo = (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="mb-6">
        {fluxoSolo || moduloUrl === "services" ? (
          <LogoTriboServicos className="text-2xl text-center" />
        ) : (
          <h1 className="text-2xl font-bold text-foreground text-center tracking-tight">TriboCar</h1>
        )}
      </div>

      <IndicadorProgresso etapaAtual={etapaAtual} etapasHabilitadas={etapasHabilitadas} />

      <div className="w-full max-w-3xl">
        {etapaAtual === 0 && (
          <EtapaIdentidade
            dados={identidade}
            onChange={setIdentidade}
            onAvancar={avancarFluxo}
          />
        )}

        {etapaAtual === 1 && (
          <EtapaModulos
            selecionados={modulosSelecionados}
            onChange={setModulosSelecionados}
            onAvancar={avancarFluxo}
            onVoltar={voltarFluxo}
          />
        )}

        {etapaAtual === 2 && (
          <EtapaPlano
            planoSelecionado={planoSelecionado}
            onSelecionar={setPlanoSelecionado}
            onAvancar={avancarFluxo}
            onVoltar={voltarFluxo}
          />
        )}

        {etapaAtual === 3 && (
          <EtapaPagamento
            planoSelecionado={planoSelecionado}
            onConfirmar={() => {
              setPagamentoConfirmado(true);
              avancarFluxo();
            }}
            onVoltar={voltarFluxo}
          />
        )}

        {etapaAtual === 4 && (
          <EtapaConfiguracao
            modulos={modulosSelecionados}
            dados={configuracao}
            onChange={setConfiguracao}
            servicos={servicos}
            onChangeServicos={setServicos}
            onAvancar={acaoAvancarConfiguracao}
            onVoltar={voltarFluxo}
            rotuloAvancar={fluxoSolo && naUltima ? "Concluir" : undefined}
            enviando={enviando}
            identidade={identidade}
            mostrarResumo={fluxoSolo && naUltima}
          />
        )}

        {etapaAtual === 5 && (
          <EtapaConvites
            subdominio={identidade.subdominio}
            onFinalizar={finalizar}
            enviando={enviando}
            modulos={modulosSelecionados}
          />
        )}
      </div>
    </div>
  );

  if (fluxoSolo || moduloUrl === "services") {
    return (
      <TemaServicos>
        <LayoutBase>{conteudo}</LayoutBase>
      </TemaServicos>
    );
  }

  return <LayoutBase>{conteudo}</LayoutBase>;
}
