import { supabase } from "@/integrations/supabase/client";
import type {
  PedidoOrcamento,
  PropostaOrcamento,
  RespostasOrcamento,
  EnderecoOrcamento,
  PerguntaOrcamento,
  ContatoOrcamento,
  UrgenciaOrcamento,
} from "../types/tipos_orcamento";

export interface PayloadCriarPedido {
  tenant_id: string;
  category_id: string;
  service_type_id?: string | null;
  template_id: string;
  perguntas_snapshot: PerguntaOrcamento[];
  respostas: RespostasOrcamento;
  endereco: EnderecoOrcamento;
  urgencia: UrgenciaOrcamento;
  data_desejada?: string | null;
  max_propostas: number;
  fotos?: string[];
  observacao?: string | null;
  contato: ContatoOrcamento;
}

export async function criarPedidoOrcamento(payload: PayloadCriarPedido): Promise<{ id: string }> {
  const { data, error } = await supabase.functions.invoke("create-quote-request", {
    body: payload,
  });
  if (error) throw error;
  if (!data?.id) throw new Error("Resposta inválida do servidor");
  return data as { id: string };
}

export async function buscarPedido(id: string): Promise<PedidoOrcamento | null> {
  const { data, error } = await supabase
    .from("service_quote_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as PedidoOrcamento | null;
}

export async function listarPropostasDoPedido(requestId: string): Promise<PropostaOrcamento[]> {
  const { data, error } = await supabase
    .from("service_quote_offers")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PropostaOrcamento[];
}

export async function aceitarProposta(offerId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("accept-quote-offer", {
    body: { offer_id: offerId },
  });
  if (error) throw error;
}

export async function cancelarPedido(id: string): Promise<void> {
  const { error } = await supabase
    .from("service_quote_requests")
    .update({ status: "cancelled", closed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function listarPedidosDoProfissional(): Promise<{
  pedidos: (PedidoOrcamento & { responded: boolean })[];
}> {
  const { data: dispatches, error } = await supabase
    .from("service_quote_dispatches")
    .select("request_id, response, responded_at")
    .order("dispatched_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const ids = (dispatches ?? []).map((d) => d.request_id);
  if (ids.length === 0) return { pedidos: [] };

  const { data: pedidos, error: errPedidos } = await supabase
    .from("service_quote_requests")
    .select("*")
    .in("id", ids);
  if (errPedidos) throw errPedidos;

  const mapResp = new Map((dispatches ?? []).map((d) => [d.request_id, d.response]));
  return {
    pedidos: ((pedidos ?? []) as unknown as PedidoOrcamento[]).map((p) => ({
      ...p,
      responded: mapResp.get(p.id) !== "pending",
    })),
  };
}

export interface PayloadEnviarProposta {
  request_id: string;
  valor: number;
  prazo_dias_min?: number | null;
  prazo_dias_max?: number | null;
  data_disponivel?: string | null;
  mensagem?: string | null;
  valid_until?: string | null;
}

export async function enviarProposta(payload: PayloadEnviarProposta): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-quote-offer", {
    body: payload,
  });
  if (error) throw error;
}
