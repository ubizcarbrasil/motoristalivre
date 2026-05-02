// Edge Function: create-quote-request
// Cria pedido de orçamento com validação de respostas, endereço (CEP/UF/cidade via ViaCEP)
// e despacha aos profissionais elegíveis da categoria.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UFS = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]);

interface Pergunta {
  id: string;
  key: string;
  label: string;
  tipo: string;
  obrigatorio: boolean;
  ordem: number;
  opcoes?: { valor: string; rotulo: string }[] | null;
  condicional?: { campo: string; igual?: string; diferente?: string } | null;
}

interface Payload {
  tenant_id: string;
  category_id: string;
  service_type_id?: string | null;
  template_id: string;
  perguntas_snapshot: Pergunta[];
  respostas: Record<string, unknown>;
  endereco: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    referencia?: string;
  };
  urgencia: "agora" | "hoje" | "esta_semana" | "data_marcada";
  data_desejada?: string | null;
  max_propostas: number;
  observacao?: string | null;
  contato: { nome: string; whatsapp: string };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function condVisivel(c: Pergunta["condicional"], r: Record<string, unknown>): boolean {
  if (!c) return true;
  const v = r[c.campo];
  const arr = Array.isArray(v) ? v.map(String) : [String(v ?? "")];
  if (c.igual !== undefined) return arr.includes(c.igual);
  if (c.diferente !== undefined) return !arr.includes(c.diferente);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  for (const k of ["tenant_id", "category_id", "template_id", "urgencia", "max_propostas"] as const) {
    if (!body[k] && body[k] !== 0) return json({ error: `Campo obrigatório: ${k}` }, 400);
  }
  if (![1, 2, 4].includes(Number(body.max_propostas))) {
    return json({ error: "max_propostas inválido" }, 400);
  }
  if (!body.contato?.nome || body.contato.nome.trim().length < 2) {
    return json({ error: "Nome inválido" }, 400);
  }
  if (!body.contato?.whatsapp || body.contato.whatsapp.replace(/\D/g, "").length < 10) {
    return json({ error: "WhatsApp inválido" }, 400);
  }

  // Valida obrigatórias
  const respostas = body.respostas ?? {};
  for (const p of body.perguntas_snapshot ?? []) {
    if (!p.obrigatorio) continue;
    if (!condVisivel(p.condicional, respostas)) continue;
    const v = respostas[p.key];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
      return json({ error: `Responda: ${p.label}` }, 400);
    }
  }

  // Valida e normaliza endereço
  const a = body.endereco ?? {};
  const cepDigits = (a.cep ?? "").replace(/\D/g, "");
  const uf = (a.uf ?? "").trim().toUpperCase().slice(0, 2);
  const cidade = (a.cidade ?? "").trim();
  if (cepDigits.length !== 8) return json({ error: "CEP inválido" }, 400);
  if (!UFS.has(uf)) return json({ error: "UF inválida" }, 400);
  if (!a.logradouro || !a.numero || !a.bairro || !cidade) {
    return json({ error: "Endereço incompleto" }, 400);
  }
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
      signal: AbortSignal.timeout(3500),
    });
    if (r.ok) {
      const v = await r.json();
      if (v?.erro) return json({ error: "CEP não encontrado" }, 400);
      if (v.uf && String(v.uf).toUpperCase() !== uf) {
        return json({ error: `UF não confere com o CEP (esperado ${v.uf})` }, 400);
      }
    }
  } catch {
    // ignora falha de rede
  }

  const enderecoNorm = {
    cep: `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`,
    logradouro: a.logradouro!.trim().slice(0, 200),
    numero: a.numero!.trim().slice(0, 20),
    complemento: (a.complemento ?? "").trim().slice(0, 100),
    bairro: a.bairro!.trim().slice(0, 120),
    cidade: cidade.slice(0, 120),
    uf,
    referencia: (a.referencia ?? "").trim().slice(0, 200),
  };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Obtém auth user (opcional)
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;
  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userId = data.user?.id ?? null;
    } catch { /* anon */ }
  }

  let clientId: string | null = null;
  let guestId: string | null = null;
  if (userId) {
    clientId = userId;
  } else {
    const { data: g, error: errG } = await supabase
      .from("guest_passengers")
      .insert({
        tenant_id: body.tenant_id,
        full_name: body.contato.nome.trim(),
        whatsapp: body.contato.whatsapp.trim(),
      })
      .select("id")
      .single();
    if (errG) return json({ error: errG.message }, 500);
    guestId = g.id;
  }

  // Cria pedido
  const { data: pedido, error: errP } = await supabase
    .from("service_quote_requests")
    .insert({
      tenant_id: body.tenant_id,
      category_id: body.category_id,
      service_type_id: body.service_type_id ?? null,
      template_id: body.template_id,
      client_id: clientId,
      guest_passenger_id: guestId,
      contact_name: body.contato.nome.trim(),
      contact_whatsapp: body.contato.whatsapp.trim(),
      respostas,
      perguntas_snapshot: body.perguntas_snapshot ?? [],
      endereco: enderecoNorm,
      urgencia: body.urgencia,
      data_desejada: body.data_desejada ?? null,
      max_propostas: body.max_propostas,
      observacao: body.observacao ?? null,
    })
    .select("id")
    .single();
  if (errP) return json({ error: errP.message }, 500);

  // Despacha para profissionais elegíveis (mesma categoria, accepting_bookings)
  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, service_categories, accepting_bookings, tenant_id")
    .eq("tenant_id", body.tenant_id)
    .eq("accepting_bookings", true);

  const elegiveis = (drivers ?? [])
    .filter((d: any) => Array.isArray(d.service_categories))
    .filter((d: any) => {
      // categories podem ser slugs ou ids; aceitamos ambos
      return d.service_categories.includes(body.category_id);
    })
    .slice(0, Math.max(body.max_propostas * 3, 6));

  if (elegiveis.length > 0) {
    const dispatches = elegiveis.map((d: any) => ({
      request_id: pedido.id,
      driver_id: d.id,
      tenant_id: body.tenant_id,
    }));
    await supabase.from("service_quote_dispatches").insert(dispatches);
  }

  return json({ id: pedido.id, dispatched: elegiveis.length }, 201);
});
