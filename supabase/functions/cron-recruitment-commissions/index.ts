// Edge function agendada (cron diário) — Fase 7
// Invoca process_recruitment_monthly() via service role.
// Idempotência garantida pela função SQL: nunca paga 2x o mesmo (referral_id, ano_mes).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing supabase env vars" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc(
      "process_recruitment_monthly" as any,
    );

    if (error) {
      console.error("[cron-recruitment] erro RPC", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resultado = Array.isArray(data) ? data[0] : data;
    console.log(
      "[cron-recruitment] processados=",
      resultado?.processados,
      "total_pago=",
      resultado?.total_pago,
    );

    return new Response(
      JSON.stringify({
        ok: true,
        processados: resultado?.processados ?? 0,
        total_pago: resultado?.total_pago ?? 0,
        executed_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("[cron-recruitment] exceção", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
