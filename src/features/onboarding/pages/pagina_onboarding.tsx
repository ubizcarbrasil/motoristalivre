import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LayoutBase } from "@/compartilhados/components/layout_base";
import { IndicadorProgresso } from "../components/indicador_progresso";
import { EtapaIdentidade } from "../components/etapa_identidade";
import { EtapaModulos } from "../components/etapa_modulos";
import { EtapaPlano } from "../components/etapa_plano";
import { EtapaPagamento } from "../components/etapa_pagamento";
import { EtapaConfiguracao } from "../components/etapa_configuracao";
import { EtapaConvites } from "../components/etapa_convites";
import { useOnboarding } from "../hooks/hook_onboarding";
import { criarGrupo } from "../services/servico_onboarding";

export default function PaginaOnboarding() {
  const navegar = useNavigate();
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
    avancar,
    voltar,
    setPagamentoConfirmado,
  } = useOnboarding();

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
      toast.success("Grupo criado com sucesso");
      window.location.href = "/admin";
    } catch (erro) {
      console.error(erro);
      toast.error("Erro ao criar grupo. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutBase>
      <div className="flex min-h-screen flex-col items-center px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground text-center tracking-tight">TriboCar</h1>
        </div>

        <IndicadorProgresso etapaAtual={etapaAtual} />

        <div className="w-full max-w-3xl">
          {etapaAtual === 0 && (
            <EtapaIdentidade
              dados={identidade}
              onChange={setIdentidade}
              onAvancar={avancar}
            />
          )}

          {etapaAtual === 1 && (
            <EtapaModulos
              selecionados={modulosSelecionados}
              onChange={setModulosSelecionados}
              onAvancar={avancar}
              onVoltar={voltar}
            />
          )}

          {etapaAtual === 2 && (
            <EtapaPlano
              planoSelecionado={planoSelecionado}
              onSelecionar={setPlanoSelecionado}
              onAvancar={avancar}
              onVoltar={voltar}
            />
          )}

          {etapaAtual === 3 && (
            <EtapaPagamento
              planoSelecionado={planoSelecionado}
              onConfirmar={() => {
                setPagamentoConfirmado(true);
                avancar();
              }}
              onVoltar={voltar}
            />
          )}

          {etapaAtual === 4 && (
            <EtapaConfiguracao
              modulos={modulosSelecionados}
              dados={configuracao}
              onChange={setConfiguracao}
              servicos={servicos}
              onChangeServicos={setServicos}
              onAvancar={avancar}
              onVoltar={voltar}
            />
          )}

          {etapaAtual === 5 && (
            <EtapaConvites
              subdominio={identidade.subdominio}
              onFinalizar={finalizar}
              enviando={enviando}
            />
          )}
        </div>
      </div>
    </LayoutBase>
  );
}
