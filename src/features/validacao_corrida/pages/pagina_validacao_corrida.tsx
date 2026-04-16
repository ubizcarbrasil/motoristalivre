import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useValidacaoCorrida } from "../hooks/hook_validacao_corrida";
import { CabecalhoValidacao } from "../components/cabecalho_validacao";
import { DetalhesValidacaoCorrida } from "../components/detalhes_validacao_corrida";
import { SeloAutenticidade } from "../components/selo_autenticidade";
import { EstadoNaoEncontrado } from "../components/estado_nao_encontrado";
import { BotaoCompartilharValidacao } from "../components/botao_compartilhar_validacao";

export default function PaginaValidacaoCorrida() {
  const { id } = useParams<{ id: string }>();
  const { carregando, resposta, erro } = useValidacaoCorrida(id);

  const cor = resposta?.branding?.cor_primaria ?? "#1db865";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabecalhoValidacao branding={resposta?.branding ?? null} />

      <main className="flex-1 px-5 py-5 max-w-md w-full mx-auto space-y-4">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Validando comprovante...
            </p>
          </div>
        ) : erro ? (
          <EstadoNaoEncontrado rideId={id} />
        ) : !resposta?.encontrada || !resposta.corrida ? (
          <EstadoNaoEncontrado rideId={id} />
        ) : (
          <>
            <SeloAutenticidade cor={cor} />
            <DetalhesValidacaoCorrida corrida={resposta.corrida} cor={cor} />
            <BotaoCompartilharValidacao
              rideId={resposta.corrida.id}
              nomeEmpresa={resposta.branding?.nome_empresa ?? null}
              cor={cor}
            />
            <p className="text-[10px] text-center text-muted-foreground pt-2">
              Identificador da corrida
              <br />
              <code className="text-[10px]">{resposta.corrida.id}</code>
            </p>
          </>
        )}
      </main>

      <footer className="px-5 py-4 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">TriboCar</span>
        </p>
      </footer>
    </div>
  );
}
