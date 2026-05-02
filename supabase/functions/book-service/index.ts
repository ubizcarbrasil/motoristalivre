// Edge Function: book-service
// Cria agendamentos de serviços com validação de disponibilidade e conflito.
// O fuso horário de validação é lido de tenant_settings.timezone
// (default 'America/Sao_Paulo' caso não esteja configurado).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EnderecoPayload {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  referencia?: string;
}

interface Payload {
  tenant_id: string;
  driver_id: string;
  service_type_id: string;
  scheduled_at: string;
  payment_method?: "cash" | "pix" | "card" | "balance";
  notes?: string;
  origin_driver_id?: string | null;
  origin_affiliate_id?: string | null;
  return_reminder_date?: string | null;
  client_id?: string | null;
  guest?: { full_name: string; whatsapp: string } | null;
  briefing?: Record<string, unknown> | null;
  address?: EnderecoPayload | null;
  factors?: Record<string, string | number | undefined> | null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

  // Validação básica
  const required = ["tenant_id", "driver_id", "service_type_id", "scheduled_at"] as const;
  for (const k of required) {
    if (!body[k]) return json({ error: `Campo obrigatório ausente: ${k}` }, 400);
  }
  if (!body.client_id && !body.guest) {
    return json({ error: "Informe client_id ou dados de guest" }, 400);
  }
  if (body.client_id && body.guest) {
    return json({ error: "Use apenas client_id OU guest, não ambos" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1) Carrega tipo de serviço
  const { data: serviceType, error: errServ } = await supabase
    .from("service_types")
    .select("*")
    .eq("id", body.service_type_id)
    .eq("driver_id", body.driver_id)
    .eq("is_active", true)
    .maybeSingle();
  if (errServ) return json({ error: errServ.message }, 500);
  if (!serviceType) return json({ error: "Serviço não encontrado ou inativo" }, 404);

  const scheduledAt = new Date(body.scheduled_at);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
    return json({ error: "Data inválida ou no passado" }, 400);
  }

  const duration = serviceType.duration_minutes as number;

  // Busca timezone configurado do tenant (default America/Sao_Paulo)
  const { data: tenantSettings } = await supabase
    .from("tenant_settings")
    .select("timezone")
    .eq("tenant_id", body.tenant_id)
    .maybeSingle();
  const timezone = (tenantSettings?.timezone as string | undefined) || "America/Sao_Paulo";

  // Extrai hora/minuto/dia-da-semana no fuso do tenant a partir do ISO recebido.
  // professional_availability.start_time é um time naive armazenado no fuso local
  // do tenant, então precisamos comparar usando o mesmo fuso.
  let tzFmt: Intl.DateTimeFormat;
  try {
    tzFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return json({ error: `Timezone inválido configurado no tenant: ${timezone}` }, 500);
  }
  const partes = tzFmt.formatToParts(scheduledAt);
  const horaStr = partes.find((p) => p.type === "hour")?.value ?? "00";
  const minStr = partes.find((p) => p.type === "minute")?.value ?? "00";
  const wkStr = partes.find((p) => p.type === "weekday")?.value ?? "Sun";
  const wkMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dow = wkMap[wkStr] ?? 0;
  const inicioMin = parseInt(horaStr, 10) * 60 + parseInt(minStr, 10);
  const fimMin = inicioMin + duration;
  const { data: blocks } = await supabase
    .from("professional_availability")
    .select("*")
    .eq("driver_id", body.driver_id)
    .eq("day_of_week", dow)
    .eq("is_active", true);

  const dentroDeBloco = (blocks ?? []).some((b: any) => {
    const [sh, sm] = (b.start_time as string).split(":").map(Number);
    const [eh, em] = (b.end_time as string).split(":").map(Number);
    const blocoIni = sh * 60 + sm;
    const blocoFim = eh * 60 + em;
    return inicioMin >= blocoIni && fimMin <= blocoFim;
  });
  // Serviços marcados como "Imediato" podem ser solicitados sem precisar
  // estar dentro de um bloco de disponibilidade cadastrado.
  if (!dentroDeBloco && !serviceType.is_immediate) {
    return json({ error: "Horário fora da disponibilidade do profissional" }, 400);
  }

  // 3) Verifica conflito (sobreposição com bookings ativos)
  const inicioIso = scheduledAt.toISOString();
  const fimDate = new Date(scheduledAt.getTime() + duration * 60_000);
  const { data: conflitos } = await supabase
    .from("service_bookings")
    .select("id, scheduled_at, duration_minutes, status")
    .eq("driver_id", body.driver_id)
    .in("status", ["pending", "confirmed", "in_progress"]);

  const temConflito = (conflitos ?? []).some((c: any) => {
    const cIni = new Date(c.scheduled_at).getTime();
    const cFim = cIni + (c.duration_minutes as number) * 60_000;
    return cIni < fimDate.getTime() && cFim > scheduledAt.getTime();
  });
  if (temConflito) {
    return json({ error: "Horário já reservado", code: "SLOT_TAKEN" }, 409);
  }

  // 4) Resolve cliente: cria guest se necessário
  let clientId = body.client_id ?? null;
  let guestId: string | null = null;
  if (body.guest) {
    const { data: guest, error: errGuest } = await supabase
      .from("guest_passengers")
      .insert({
        tenant_id: body.tenant_id,
        full_name: body.guest.full_name.trim(),
        whatsapp: body.guest.whatsapp.trim(),
      })
      .select("id")
      .single();
    if (errGuest) return json({ error: errGuest.message }, 500);
    guestId = guest.id;
  }

  // 4.5) Validação + normalização de endereço
  const UFS_VALIDAS = new Set([
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
    "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
  ]);

  const normStr = (v: unknown, max: number): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim().replace(/\s+/g, " ");
    if (!t) return null;
    return t.slice(0, max);
  };

  let enderecoNormalizado: Required<EnderecoPayload> | null = null;
  if (body.address || serviceType.requires_address) {
    const a = body.address ?? {};
    const cepDigits = (a.cep ?? "").replace(/\D/g, "");
    const logradouro = normStr(a.logradouro, 200);
    const numero = normStr(a.numero, 20);
    const complemento = normStr(a.complemento, 100);
    const bairro = normStr(a.bairro, 120);
    const cidade = normStr(a.cidade, 120);
    const uf = (a.uf ?? "").trim().toUpperCase().slice(0, 2);
    const referencia = normStr(a.referencia, 200);

    if (serviceType.requires_address) {
      if (cepDigits.length !== 8) return json({ error: "CEP inválido (8 dígitos)" }, 400);
      if (!logradouro) return json({ error: "Logradouro obrigatório" }, 400);
      if (!numero) return json({ error: "Número obrigatório" }, 400);
      if (!bairro) return json({ error: "Bairro obrigatório" }, 400);
      if (!cidade) return json({ error: "Cidade obrigatória" }, 400);
      if (!UFS_VALIDAS.has(uf)) return json({ error: "UF inválida" }, 400);
    } else if (cepDigits && cepDigits.length !== 8) {
      return json({ error: "CEP inválido (8 dígitos)" }, 400);
    }

    // Confirma CEP via ViaCEP e cross-check de cidade/UF (best-effort)
    if (cepDigits.length === 8) {
      try {
        const r = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
          signal: AbortSignal.timeout(3500),
        });
        if (r.ok) {
          const via = await r.json();
          if (via?.erro) {
            return json({ error: "CEP não encontrado" }, 400);
          }
          if (uf && via.uf && String(via.uf).toUpperCase() !== uf) {
            return json({ error: `UF não confere com o CEP (esperado ${via.uf})` }, 400);
          }
          if (
            cidade && via.localidade &&
            cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() !==
              String(via.localidade).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          ) {
            return json({ error: `Cidade não confere com o CEP (esperado ${via.localidade})` }, 400);
          }
        }
      } catch {
        // Falha de rede não bloqueia o agendamento
      }
    }

    enderecoNormalizado = {
      cep: cepDigits ? `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}` : "",
      logradouro: logradouro ?? "",
      numero: numero ?? "",
      complemento: complemento ?? "",
      bairro: bairro ?? "",
      cidade: cidade ?? "",
      uf: uf ?? "",
      referencia: referencia ?? "",
    };
  }

  // Carrega fatores e recalcula
  const { data: fatoresDb } = await supabase
    .from("service_pricing_factors")
    .select("*")
    .eq("service_type_id", body.service_type_id);

  const linhasSnapshot: Array<{ key: string; rotulo: string; valor: number }> = [];
  let acrescimo = 0;
  const valoresEntrada = body.factors ?? {};
  for (const f of (fatoresDb ?? []) as any[]) {
    const v = valoresEntrada[f.key];
    if (f.required && (v === undefined || v === null || v === "")) {
      return json({ error: `Informe: ${f.label}` }, 400);
    }
    if (v === undefined || v === null || v === "") continue;
    if (f.input_type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) continue;
      const valor = n * (Number(f.unit_price) || 0);
      acrescimo += valor;
      linhasSnapshot.push({ key: f.key, rotulo: `${f.label}: ${n}${f.unit ? ` ${f.unit}` : ""}`, valor });
    } else if (f.input_type === "select" && Array.isArray(f.options)) {
      const op = f.options.find((o: any) => o.valor === String(v));
      if (!op) continue;
      const mult = Number(op.multiplicador);
      if (Number.isFinite(mult) && mult !== 0 && mult !== 1) {
        const v2 = Number(serviceType.price) * (mult - 1);
        acrescimo += v2;
        linhasSnapshot.push({ key: f.key, rotulo: `${f.label}: ${op.rotulo}`, valor: v2 });
      }
      const ac = Number(op.acrescimo) || 0;
      if (ac !== 0) {
        acrescimo += ac;
        linhasSnapshot.push({ key: f.key, rotulo: `${f.label}: ${op.rotulo}`, valor: ac });
      }
    }
  }

  const travelFee = Number(serviceType.travel_fee_base) || 0;
  const totalPrice = Math.round((Number(serviceType.price) + acrescimo + travelFee) * 100) / 100;

  // 5) Insere booking
  const { data: booking, error: errBook } = await supabase
    .from("service_bookings")
    .insert({
      tenant_id: body.tenant_id,
      driver_id: body.driver_id,
      client_id: clientId,
      guest_passenger_id: guestId,
      service_type_id: body.service_type_id,
      origin_driver_id: body.origin_driver_id ?? null,
      origin_affiliate_id: body.origin_affiliate_id ?? null,
      scheduled_at: inicioIso,
      duration_minutes: duration,
      price_agreed: totalPrice,
      total_price: totalPrice,
      travel_fee: travelFee,
      factors_snapshot: { valores: valoresEntrada, linhas: linhasSnapshot, base: Number(serviceType.price) },
      payment_method: body.payment_method ?? "cash",
      status: "confirmed",
      notes: body.notes ?? null,
      return_reminder_date: body.return_reminder_date ?? null,
      briefing:
        body.briefing && typeof body.briefing === "object"
          ? body.briefing
          : {},
    })
    .select("*")
    .single();
  if (errBook) return json({ error: errBook.message }, 500);

  // 5.1) Persiste endereço normalizado
  if (enderecoNormalizado) {
    await supabase.from("service_booking_addresses").insert({
      booking_id: booking.id,
      tenant_id: body.tenant_id,
      cep: enderecoNormalizado.cep || null,
      logradouro: enderecoNormalizado.logradouro || null,
      numero: enderecoNormalizado.numero || null,
      complemento: enderecoNormalizado.complemento || null,
      bairro: enderecoNormalizado.bairro || null,
      cidade: enderecoNormalizado.cidade || null,
      uf: enderecoNormalizado.uf || null,
      referencia: enderecoNormalizado.referencia || null,
    });
  }

  // 6) Lembrete de retorno
  if (body.return_reminder_date) {
    await supabase.from("service_reminders").insert({
      booking_id: booking.id,
      client_id: clientId,
      driver_id: body.driver_id,
      remind_at: body.return_reminder_date,
      status: "pending",
    });
  }

  return json({ booking }, 201);
});
