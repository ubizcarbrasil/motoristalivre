import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RespostaValidacao {
  encontrada: boolean;
  corrida?: {
    id: string;
    data_iso: string;
    valor: number | null;
    pagamento: string;
    motorista_nome: string | null;
    veiculo_modelo: string | null;
    veiculo_cor: string | null;
    veiculo_placa: string | null;
    origem: string | null;
    destino: string | null;
    distancia_km: number | null;
  };
  branding?: {
    nome_empresa: string | null;
    logo_url: string | null;
    cor_primaria: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const rideId = url.searchParams.get("id");

    if (!rideId || !UUID_REGEX.test(rideId)) {
      return new Response(
        JSON.stringify({ error: "ID de corrida inválido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Tenta primeiro como ride concluída
    const { data: ride } = await supabase
      .from("rides")
      .select(
        "id, tenant_id, driver_id, ride_request_id, price_paid, payment_method, completed_at, created_at",
      )
      .eq("id", rideId)
      .maybeSingle();

    let tenantId: string | null = null;
    let dadosCorrida: RespostaValidacao["corrida"] | undefined;

    if (ride) {
      tenantId = ride.tenant_id;

      const [driverRes, userRes, requestRes] = await Promise.all([
        supabase
          .from("drivers")
          .select("vehicle_model, vehicle_color, vehicle_plate")
          .eq("id", ride.driver_id)
          .maybeSingle(),
        supabase
          .from("users")
          .select("full_name")
          .eq("id", ride.driver_id)
          .maybeSingle(),
        supabase
          .from("ride_requests")
          .select("origin_address, dest_address, distance_km")
          .eq("id", ride.ride_request_id)
          .maybeSingle(),
      ]);

      dadosCorrida = {
        id: ride.id,
        data_iso: ride.completed_at ?? ride.created_at,
        valor: ride.price_paid !== null ? Number(ride.price_paid) : null,
        pagamento: ride.payment_method,
        motorista_nome: userRes.data?.full_name ?? null,
        veiculo_modelo: driverRes.data?.vehicle_model ?? null,
        veiculo_cor: driverRes.data?.vehicle_color ?? null,
        veiculo_placa: driverRes.data?.vehicle_plate ?? null,
        origem: requestRes.data?.origin_address ?? null,
        destino: requestRes.data?.dest_address ?? null,
        distancia_km:
          requestRes.data?.distance_km !== null &&
          requestRes.data?.distance_km !== undefined
            ? Number(requestRes.data.distance_km)
            : null,
      };
    } else {
      // Fallback: ride_request (corrida não concluída)
      const { data: request } = await supabase
        .from("ride_requests")
        .select(
          "id, tenant_id, origin_address, dest_address, distance_km, final_price, suggested_price, payment_method, created_at",
        )
        .eq("id", rideId)
        .maybeSingle();

      if (!request) {
        const resposta: RespostaValidacao = { encontrada: false };
        return new Response(JSON.stringify(resposta), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      tenantId = request.tenant_id;
      dadosCorrida = {
        id: request.id,
        data_iso: request.created_at,
        valor:
          request.final_price !== null
            ? Number(request.final_price)
            : request.suggested_price !== null
              ? Number(request.suggested_price)
              : null,
        pagamento: request.payment_method,
        motorista_nome: null,
        veiculo_modelo: null,
        veiculo_cor: null,
        veiculo_placa: null,
        origem: request.origin_address,
        destino: request.dest_address,
        distancia_km:
          request.distance_km !== null ? Number(request.distance_km) : null,
      };
    }

    // Busca branding do tenant
    const [brandingRes, tenantRes] = await Promise.all([
      supabase
        .from("tenant_branding")
        .select("logo_url, primary_color")
        .eq("tenant_id", tenantId!)
        .maybeSingle(),
      supabase.from("tenants").select("name").eq("id", tenantId!).maybeSingle(),
    ]);

    const resposta: RespostaValidacao = {
      encontrada: true,
      corrida: dadosCorrida,
      branding: {
        nome_empresa: tenantRes.data?.name ?? null,
        logo_url: brandingRes.data?.logo_url ?? null,
        cor_primaria: brandingRes.data?.primary_color ?? "#1db865",
      },
    };

    return new Response(JSON.stringify(resposta), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("[validar-corrida] erro:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
