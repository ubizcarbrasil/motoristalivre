import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  buscarPedido,
  listarPropostasDoPedido,
  aceitarProposta,
  cancelarPedido,
} from "../services/servico_orcamentos";
import type { PedidoOrcamento, PropostaOrcamento } from "../types/tipos_orcamento";
import { supabase } from "@/integrations/supabase/client";

export default function PaginaAcompanharOrcamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoOrcamento | null>(null);
  const [propostas, setPropostas] = useState<PropostaOrcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aceitando, setAceitando] = useState<string | null>(null);

  const recarregar = async () => {
    if (!id) return;
    const [p, ofs] = await Promise.all([buscarPedido(id), listarPropostasDoPedido(id)]);
    setPedido(p);
    setPropostas(ofs);
  };

  useEffect(() => {
    if (!id) return;
    recarregar()
      .catch(() => toast.error("Não foi possível carregar o pedido"))
      .finally(() => setCarregando(false));

    const ch = supabase
      .channel(`quote-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_quote_offers", filter: `request_id=eq.${id}` },
        () => recarregar(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAceitar = async (offerId: string) => {
    setAceitando(offerId);
    try {
      await aceitarProposta(offerId);
      toast.success("Proposta aceita!");
      await recarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao aceitar");
    } finally {
      setAceitando(null);
    }
  };

  const handleCancelar = async () => {
    if (!id) return;
    if (!confirm("Cancelar este pedido?")) return;
    try {
      await cancelarPedido(id);
      toast.success("Pedido cancelado");
      navigate(-1);
    } catch {
      toast.error("Erro ao cancelar");
    }
  };

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-foreground">Pedido não encontrado</p>
        <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Meu pedido</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <section className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {pedido.status === "open" ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Aguardando propostas</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{pedido.status}</span>
              </>
            )}
          </div>
          <p className="text-sm text-foreground mt-2">
            Você receberá até {pedido.max_propostas} propostas. Os profissionais já foram avisados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Propostas ({propostas.length})
          </h2>
          {propostas.length === 0 && (
            <div className="rounded-2xl bg-card border border-border p-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aguardando propostas dos profissionais...
              </p>
            </div>
          )}

          {propostas.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-foreground">
                  R$ {Number(o.valor).toFixed(2).replace(".", ",")}
                </p>
                <span className="text-xs text-muted-foreground capitalize">{o.status}</span>
              </div>
              {(o.prazo_dias_min || o.prazo_dias_max) && (
                <p className="text-xs text-muted-foreground">
                  Prazo: {o.prazo_dias_min ?? "?"}–{o.prazo_dias_max ?? "?"} dias
                </p>
              )}
              {o.mensagem && <p className="text-sm text-foreground">{o.mensagem}</p>}
              {o.status === "pending" && pedido.status === "open" && (
                <Button
                  onClick={() => handleAceitar(o.id)}
                  disabled={aceitando === o.id}
                  className="w-full"
                >
                  {aceitando === o.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Aceitar proposta"
                  )}
                </Button>
              )}
            </div>
          ))}
        </section>

        {pedido.status === "open" && (
          <Button onClick={handleCancelar} variant="ghost" className="w-full text-destructive">
            Cancelar pedido
          </Button>
        )}
      </main>
    </div>
  );
}
