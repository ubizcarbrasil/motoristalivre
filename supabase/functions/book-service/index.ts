// Edge Function: book-service
// Cria agendamentos de serviços com validação de disponibilidade e conflito.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  // Extrai hora/minuto/dia-da-semana no fuso LOCAL do cliente a partir do ISO recebido.
  // O cliente envia ISO derivado de setHours() local + toISOString(); precisamos reverter
  // para o instante local equivalente, pois professional_availability.start_time é local naive.
  // Estratégia: o ISO traz o instante absoluto. Calculamos o offset reverso usando o fuso
  // do tenant — mas como não temos isso configurado, assumimos America/Sao_Paulo (UTC-3).
  // Para robustez, derivamos hora/min/dow a partir de um Date convertido pra string com
  // timeZone explícito.
  const tzFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
  if (!dentroDeBloco) {
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
      price_agreed: serviceType.price,
      payment_method: body.payment_method ?? "cash",
      status: "confirmed",
      notes: body.notes ?? null,
      return_reminder_date: body.return_reminder_date ?? null,
    })
    .select("*")
    .single();
  if (errBook) return json({ error: errBook.message }, 500);

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
