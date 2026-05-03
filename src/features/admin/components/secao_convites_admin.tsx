import { useState } from "react";
import { useConvitesAdmin } from "../hooks/hook_convites_admin";
import { BuscaProfissionalAdmin } from "./busca_profissional_admin";
import { ListaSolicitacoesRecebidas } from "./lista_solicitacoes_recebidas";
import { ListaConvitesEnviados } from "./lista_convites_enviados";
import { Loader2 } from "lucide-react";
import { BotaoLinkRecrutamento } from "@/features/painel/components/botao_link_recrutamento";

interface Props {
  tenantId: string;
  signupSlug?: string | null;
  nomeTribo?: string;
}

type AbaInterna = "convidar" | "solicitacoes" | "enviados";

const ABAS: { id: AbaInterna; label: string }[] = [
  { id: "convidar", label: "Convidar" },
  { id: "solicitacoes", label: "Solicitações" },
  { id: "enviados", label: "Enviados" },
];

export function SecaoConvitesAdmin({ tenantId, signupSlug, nomeTribo }: Props) {
  const [aba, setAba] = useState<AbaInterna>("convidar");
  const {
    resultadosBusca,
    carregandoBusca,
    buscar,
    convidar,
    solicitacoes,
    convites,
    filtroStatus,
    setFiltroStatus,
    carregando,
    cancelar,
    responder,
  } = useConvitesAdmin(tenantId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Convites de profissionais</h3>
        <p className="text-xs text-muted-foreground">
          Encontre, convide e gerencie profissionais da sua tribo.
        </p>
      </div>

      <BotaoLinkRecrutamento
        signupSlug={signupSlug ?? null}
        nomeTribo={nomeTribo ?? "sua tribo"}
      />

      <div className="flex gap-1 border-b border-border">
        {ABAS.map((a) => {
          const ativo = aba === a.id;
          const badge =
            a.id === "solicitacoes" && solicitacoes.length > 0
              ? solicitacoes.length
              : null;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAba(a.id)}
              className={`relative px-3 py-2 text-xs font-medium transition-colors ${
                ativo
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground border-b-2 border-transparent hover:text-foreground"
              }`}
            >
              {a.label}
              {badge !== null && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {aba === "convidar" && (
        <BuscaProfissionalAdmin
          resultados={resultadosBusca}
          carregando={carregandoBusca}
          onBuscar={buscar}
          onConvidar={convidar}
        />
      )}

      {aba === "solicitacoes" && (
        carregando ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ListaSolicitacoesRecebidas solicitacoes={solicitacoes} onResponder={responder} />
        )
      )}

      {aba === "enviados" && (
        carregando ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ListaConvitesEnviados
            convites={convites}
            filtro={filtroStatus}
            onMudarFiltro={setFiltroStatus}
            onCancelar={cancelar}
          />
        )
      )}
    </div>
  );
}
