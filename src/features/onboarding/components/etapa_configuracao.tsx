import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SecaoConfiguracaoMobilidade } from "./secao_configuracao_mobilidade";
import { SecaoConfiguracaoServicos } from "./secao_configuracao_servicos";
import { SecaoComissaoCashback } from "./secao_comissao_cashback";
import { ResumoConfirmacao } from "./resumo_confirmacao";
import {
  EditorDisponibilidadeSemanal,
  diasParaBlocosPlanos,
} from "@/features/painel/components/editor_disponibilidade_semanal";
import type {
  DadosConfiguracao,
  DadosDisponibilidadeOnboarding,
  DadosIdentidade,
  DadosServico,
  ModuloPlataforma,
} from "../types/tipos_onboarding";

interface EtapaConfiguracaoProps {
  modulos: ModuloPlataforma[];
  dados: DadosConfiguracao;
  onChange: (dados: DadosConfiguracao) => void;
  servicos: DadosServico[];
  onChangeServicos: (servicos: DadosServico[]) => void;
  disponibilidade: DadosDisponibilidadeOnboarding;
  onChangeDisponibilidade: (d: DadosDisponibilidadeOnboarding) => void;
  onAvancar: () => void;
  onVoltar: () => void;
  rotuloAvancar?: string;
  enviando?: boolean;
  identidade?: DadosIdentidade;
  mostrarResumo?: boolean;
}

export function EtapaConfiguracao({
  modulos,
  dados,
  onChange,
  servicos,
  onChangeServicos,
  disponibilidade,
  onChangeDisponibilidade,
  onAvancar,
  onVoltar,
  rotuloAvancar,
  enviando,
  identidade,
  mostrarResumo,
}: EtapaConfiguracaoProps) {
  const temMobilidade = modulos.includes("mobility");
  const temServicos = modulos.includes("services");

  const validar = () => {
    if (temServicos) {
      const validos = servicos.filter(
        (s) => s.nome.trim().length > 0 && s.preco > 0,
      );
      if (validos.length === 0) {
        toast.error("Cadastre pelo menos um serviço com nome e preço.");
        return false;
      }
      const blocos = diasParaBlocosPlanos(disponibilidade.dias);
      if (blocos.length === 0) {
        toast.error("Defina ao menos um dia de atendimento na agenda.");
        return false;
      }
    }
    return true;
  };

  const tentarAvancar = () => {
    if (validar()) onAvancar();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuração inicial</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {temServicos && !temMobilidade
            ? "Defina os serviços que você oferece e seus horários de atendimento."
            : temServicos && temMobilidade
              ? "Defina como corridas e serviços serão cobrados."
              : "Defina como as corridas serão distribuídas e precificadas."}
        </p>
      </div>

      {temMobilidade && (
        <SecaoConfiguracaoMobilidade dados={dados} onChange={onChange} />
      )}

      {temServicos && (
        <>
          <SecaoConfiguracaoServicos servicos={servicos} onChange={onChangeServicos} />

          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sua agenda</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure quando você atende. Você pode ajustar a qualquer momento depois.
              </p>
            </div>
            <EditorDisponibilidadeSemanal
              dias={disponibilidade.dias}
              onChangeDias={(dias) =>
                onChangeDisponibilidade({ ...disponibilidade, dias })
              }
              slotMin={disponibilidade.slotMin}
              onChangeSlotMin={(slotMin) =>
                onChangeDisponibilidade({ ...disponibilidade, slotMin })
              }
              bufferMin={disponibilidade.bufferMin}
              onChangeBufferMin={(bufferMin) =>
                onChangeDisponibilidade({ ...disponibilidade, bufferMin })
              }
              ocultarSalvar
            />
          </div>
        </>
      )}

      <SecaoComissaoCashback dados={dados} onChange={onChange} />

      {mostrarResumo && identidade && (
        <ResumoConfirmacao identidade={identidade} modulos={modulos} />
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} className="flex-1" disabled={enviando}>
          Voltar
        </Button>
        <Button onClick={tentarAvancar} className="flex-1" disabled={enviando}>
          {rotuloAvancar ?? "Continuar"}
        </Button>
      </div>
    </div>
  );
}
