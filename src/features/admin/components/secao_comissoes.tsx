import { Loader2, Percent, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHookComissoes } from "../hooks/hook_comissoes";
import { ControlePercentualComissao } from "./controle_percentual_comissao";

interface Props {
  modo?: "mobilidade" | "servicos" | "hibrido";
}

export function SecaoComissoes({ modo = "mobilidade" }: Props = {}) {
  const { valores, atualizarCampo, salvar, carregando, salvando } = useHookComissoes();

  const mostrarTransbordo = modo === "mobilidade" || modo === "hibrido";

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Comissões e cashback</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Defina os percentuais cobrados pela plataforma e o cashback devolvido aos clientes.
          As alterações afetam apenas movimentações futuras.
        </p>
      </header>

      <div className="space-y-3">
        {mostrarTransbordo && (
          <ControlePercentualComissao
            id="comissao-transbordo"
            titulo="Comissão de transbordo"
            descricao="Percentual descontado do profissional que atende uma corrida originada por outro profissional do grupo."
            valor={valores.transbordo_commission}
            onChange={(v) => atualizarCampo("transbordo_commission", v)}
            desabilitado={salvando}
            max={50}
          />
        )}

        <ControlePercentualComissao
          id="comissao-afiliado"
          titulo="Comissão de afiliado"
          descricao="Percentual repassado ao afiliado que originou o cliente."
          valor={valores.affiliate_commission}
          onChange={(v) => atualizarCampo("affiliate_commission", v)}
          desabilitado={salvando}
          max={50}
        />

        <ControlePercentualComissao
          id="cashback-padrao"
          titulo="Cashback padrão"
          descricao="Percentual devolvido ao cliente como crédito para usar em corridas/serviços futuros."
          valor={valores.cashback_pct}
          onChange={(v) => atualizarCampo("cashback_pct", v)}
          desabilitado={salvando}
          max={30}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={salvando} className="gap-2">
          {salvando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {salvando ? "Salvando..." : "Salvar comissões"}
        </Button>
      </div>
    </div>
  );
}
