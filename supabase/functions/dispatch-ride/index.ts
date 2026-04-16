import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface TenantSettings {
  dispatch_mode: "auto" | "manual" | "hybrid";
  dispatch_radius_km: number;
  dispatch_timeout_sec: number;
  dispatch_max_attempts: number;
  transbordo_commission: number;
  affiliate_commission: number;
  cashback_pct: number;
}

// ─── Helpers ───

async function carregarSettings(tenantId: string): Promise<TenantSettings | null> {
  const { data } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();
  return data;
}

async function buscarMotoristasOnline(tenantId: string): Promise<string[]> {
  const { data } = await supabase
    .from("drivers")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("is_online", true);
  return (data || []).map((d) => d.id);
}

async function criarDispatch(
  rideRequestId: string,
  driverId: string,
  tenantId: string,
  attempt: number
) {
  await supabase.from("ride_dispatches").insert({
    ride_request_id: rideRequestId,
    driver_id: driverId,
    tenant_id: tenantId,
    attempt_number: attempt,
    response: "pending",
  });
}

async function atualizarStatusRequest(requestId: string, status: string) {
  await supabase
    .from("ride_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);
}

async function marcarDispatchTimeout(dispatchId: string) {
  await supabase
    .from("ride_dispatches")
    .update({ response: "timeout", responded_at: new Date().toISOString() })
    .eq("id", dispatchId);
}

async function registrarAuditLog(
  tenantId: string,
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  payload: Record<string, unknown> = {}
) {
  await supabase.from("audit_logs").insert({
    tenant_id: tenantId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    payload,
  });
}

// ─── Core dispatch logic ───

async function dispatchRide(rideRequestId: string) {
  const { data: request } = await supabase
    .from("ride_requests")
    .select("*")
    .eq("id", rideRequestId)
    .single();

  if (!request || request.status !== "pending") return;

  const settings = await carregarSettings(request.tenant_id);
  if (!settings) return;

  const motoristasOnline = await buscarMotoristasOnline(request.tenant_id);
  if (motoristasOnline.length === 0) {
    await atualizarStatusRequest(rideRequestId, "expired");
    return;
  }

  let motoristasOrdenados: string[] = [];

  // dispatch_mode: auto = owner_priority, manual = proximity, hybrid = broadcast
  if (settings.dispatch_mode === "auto" && request.origin_driver_id) {
    // Owner priority: try owner first, then others
    const ownerOnline = motoristasOnline.includes(request.origin_driver_id);
    if (ownerOnline) {
      motoristasOrdenados = [
        request.origin_driver_id,
        ...motoristasOnline.filter((id) => id !== request.origin_driver_id),
      ];
    } else {
      motoristasOrdenados = motoristasOnline;
    }
  } else if (settings.dispatch_mode === "manual") {
    // Proximity mode — for now use all online (geo sorting requires location data)
    motoristasOrdenados = motoristasOnline;
  } else {
    // Broadcast: all at once
    motoristasOrdenados = motoristasOnline;
  }

  await atualizarStatusRequest(rideRequestId, "dispatching");

  if (settings.dispatch_mode === "hybrid") {
    // Broadcast: dispatch to all at once
    for (const driverId of motoristasOrdenados) {
      await criarDispatch(rideRequestId, driverId, request.tenant_id, 1);
    }
  } else {
    // Sequential: dispatch to first
    if (motoristasOrdenados.length > 0) {
      await criarDispatch(rideRequestId, motoristasOrdenados[0], request.tenant_id, 1);
    }
  }

  await registrarAuditLog(
    request.tenant_id,
    null,
    "DISPATCH_STARTED",
    "RIDE_REQUEST",
    rideRequestId,
    { dispatch_mode: settings.dispatch_mode, drivers_count: motoristasOrdenados.length }
  );
}

// ─── Handle driver response ───

async function handleDriverResponse(
  dispatchId: string,
  response: "accepted" | "rejected"
) {
  const { data: dispatch } = await supabase
    .from("ride_dispatches")
    .select("*")
    .eq("id", dispatchId)
    .single();

  if (!dispatch || dispatch.response !== "pending") return;

  await supabase
    .from("ride_dispatches")
    .update({ response, responded_at: new Date().toISOString() })
    .eq("id", dispatchId);

  if (response === "accepted") {
    // Cancel other pending dispatches for this request
    await supabase
      .from("ride_dispatches")
      .update({ response: "rejected", responded_at: new Date().toISOString() })
      .eq("ride_request_id", dispatch.ride_request_id)
      .eq("response", "pending")
      .neq("id", dispatchId);

    // Update ride request
    await atualizarStatusRequest(dispatch.ride_request_id, "accepted");

    // Load ride request to get passenger info
    const { data: request } = await supabase
      .from("ride_requests")
      .select("*")
      .eq("id", dispatch.ride_request_id)
      .single();

    if (request) {
      const isTransbordo = request.origin_driver_id != null && request.origin_driver_id !== dispatch.driver_id;

      await supabase.from("rides").insert({
        ride_request_id: dispatch.ride_request_id,
        driver_id: dispatch.driver_id,
        passenger_id: request.passenger_id,
        tenant_id: dispatch.tenant_id,
        is_transbordo: isTransbordo,
        origin_driver_id: request.origin_driver_id,
        origin_affiliate_id: request.origin_affiliate_id,
        price_paid: request.offered_price || request.suggested_price,
      });

      await registrarAuditLog(
        dispatch.tenant_id,
        dispatch.driver_id,
        "RIDE_ACCEPTED",
        "RIDE_REQUEST",
        dispatch.ride_request_id,
        { driver_id: dispatch.driver_id, is_transbordo: isTransbordo }
      );
    }
  } else {
    // Rejected: try next driver (sequential mode)
    await tryNextDriver(dispatch.ride_request_id, dispatch.tenant_id, dispatch.attempt_number);
  }
}

async function tryNextDriver(rideRequestId: string, tenantId: string, currentAttempt: number) {
  const settings = await carregarSettings(tenantId);
  if (!settings) return;

  if (currentAttempt >= settings.dispatch_max_attempts) {
    await atualizarStatusRequest(rideRequestId, "expired");
    await registrarAuditLog(tenantId, null, "RIDE_EXPIRED", "RIDE_REQUEST", rideRequestId, {});
    return;
  }

  // Find drivers not yet dispatched
  const { data: existingDispatches } = await supabase
    .from("ride_dispatches")
    .select("driver_id")
    .eq("ride_request_id", rideRequestId);

  const dispatchedIds = new Set((existingDispatches || []).map((d) => d.driver_id));
  const motoristasOnline = await buscarMotoristasOnline(tenantId);
  const candidatos = motoristasOnline.filter((id) => !dispatchedIds.has(id));

  if (candidatos.length === 0) {
    await atualizarStatusRequest(rideRequestId, "expired");
    await registrarAuditLog(tenantId, null, "RIDE_EXPIRED", "RIDE_REQUEST", rideRequestId, { reason: "no_drivers_available" });
    return;
  }

  await criarDispatch(rideRequestId, candidatos[0], tenantId, currentAttempt + 1);
}

// ─── Handle timeout check ───

async function handleTimeoutCheck(rideRequestId: string) {
  const settings_res = await supabase
    .from("ride_requests")
    .select("tenant_id, status")
    .eq("id", rideRequestId)
    .single();

  if (!settings_res.data || settings_res.data.status !== "dispatching") return;

  const tenantId = settings_res.data.tenant_id;
  const settings = await carregarSettings(tenantId);
  if (!settings) return;

  const { data: pendingDispatches } = await supabase
    .from("ride_dispatches")
    .select("*")
    .eq("ride_request_id", rideRequestId)
    .eq("response", "pending");

  for (const dispatch of pendingDispatches || []) {
    const elapsed = (Date.now() - new Date(dispatch.dispatched_at).getTime()) / 1000;
    if (elapsed >= settings.dispatch_timeout_sec) {
      await marcarDispatchTimeout(dispatch.id);
      await tryNextDriver(rideRequestId, tenantId, dispatch.attempt_number);
    }
  }
}

// ─── Complete ride & process commissions ───

async function completeRide(rideId: string) {
  const { data: ride } = await supabase
    .from("rides")
    .select("*")
    .eq("id", rideId)
    .single();

  if (!ride) return;

  const now = new Date().toISOString();
  await supabase
    .from("rides")
    .update({ completed_at: now })
    .eq("id", rideId);

  await atualizarStatusRequest(ride.ride_request_id, "completed");

  const settings = await carregarSettings(ride.tenant_id);
  if (!settings || !ride.price_paid) return;

  const pricePaid = ride.price_paid;

  // Process transbordo commission
  if (ride.is_transbordo && ride.origin_driver_id) {
    const comissaoValor = (pricePaid * settings.transbordo_commission) / 100;

    if (comissaoValor > 0) {
      // Get driver wallet
      const { data: driverWallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("owner_id", ride.driver_id)
        .eq("owner_type", "driver")
        .single();

      const { data: originWallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("owner_id", ride.origin_driver_id)
        .eq("owner_type", "driver")
        .single();

      if (driverWallet && originWallet) {
        // Debit from attending driver
        const newDriverBalance = driverWallet.balance - comissaoValor;
        await supabase.from("wallets").update({ balance: newDriverBalance }).eq("id", driverWallet.id);
        await supabase.from("wallet_transactions").insert({
          wallet_id: driverWallet.id,
          tenant_id: ride.tenant_id,
          type: "commission_transbordo",
          amount: -comissaoValor,
          balance_after: newDriverBalance,
          description: `Comissao transbordo - corrida ${rideId.slice(0, 8)}`,
          reference_id: rideId,
        });

        // Credit to origin driver
        const newOriginBalance = originWallet.balance + comissaoValor;
        await supabase.from("wallets").update({ balance: newOriginBalance }).eq("id", originWallet.id);
        await supabase.from("wallet_transactions").insert({
          wallet_id: originWallet.id,
          tenant_id: ride.tenant_id,
          type: "commission_transbordo",
          amount: comissaoValor,
          balance_after: newOriginBalance,
          description: `Receita transbordo - corrida ${rideId.slice(0, 8)}`,
          reference_id: rideId,
        });

        await supabase.from("commissions").insert({
          ride_id: rideId,
          tenant_id: ride.tenant_id,
          commission_type: "transbordo",
          amount: comissaoValor,
          from_wallet_id: driverWallet.id,
          to_wallet_id: originWallet.id,
          status: "processed",
          processed_at: now,
        });
      }
    }
  }

  // Process affiliate commission
  if (ride.origin_affiliate_id) {
    const comissaoAfiliado = (pricePaid * settings.affiliate_commission) / 100;

    if (comissaoAfiliado > 0) {
      const { data: affiliateWallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("owner_id", ride.origin_affiliate_id)
        .eq("owner_type", "affiliate")
        .single();

      if (affiliateWallet) {
        const newBalance = affiliateWallet.balance + comissaoAfiliado;
        await supabase.from("wallets").update({ balance: newBalance }).eq("id", affiliateWallet.id);
        await supabase.from("wallet_transactions").insert({
          wallet_id: affiliateWallet.id,
          tenant_id: ride.tenant_id,
          type: "commission_affiliate",
          amount: comissaoAfiliado,
          balance_after: newBalance,
          description: `Comissao afiliado - corrida ${rideId.slice(0, 8)}`,
          reference_id: rideId,
        });

        await supabase.from("commissions").insert({
          ride_id: rideId,
          tenant_id: ride.tenant_id,
          commission_type: "affiliate",
          amount: comissaoAfiliado,
          to_wallet_id: affiliateWallet.id,
          status: "processed",
          processed_at: now,
        });
      }
    }
  }

  // Credit driver earnings
  const { data: driverWallet } = await supabase
    .from("wallets")
    .select("id, balance, total_earned")
    .eq("owner_id", ride.driver_id)
    .eq("owner_type", "driver")
    .single();

  if (driverWallet) {
    const newBalance = driverWallet.balance + pricePaid;
    const newTotalEarned = driverWallet.total_earned + pricePaid;
    await supabase.from("wallets").update({ balance: newBalance, total_earned: newTotalEarned }).eq("id", driverWallet.id);
    await supabase.from("wallet_transactions").insert({
      wallet_id: driverWallet.id,
      tenant_id: ride.tenant_id,
      type: "ride_earning",
      amount: pricePaid,
      balance_after: newBalance,
      description: `Corrida ${rideId.slice(0, 8)}`,
      reference_id: rideId,
    });
  }

  // Process cashback
  if (settings.cashback_pct > 0) {
    const cashbackAmount = (pricePaid * settings.cashback_pct) / 100;
    await supabase.from("rides").update({ cashback_amount: cashbackAmount }).eq("id", rideId);

    const { data: passenger } = await supabase
      .from("passengers")
      .select("id, cashback_balance")
      .eq("id", ride.passenger_id)
      .single();

    if (passenger) {
      const newCashback = passenger.cashback_balance + cashbackAmount;
      await supabase.from("passengers").update({ cashback_balance: newCashback }).eq("id", passenger.id);
      await supabase.from("cashback_transactions").insert({
        passenger_id: passenger.id,
        tenant_id: ride.tenant_id,
        type: "credit",
        amount: cashbackAmount,
        balance_after: newCashback,
        ride_id: rideId,
      });
    }
  }

  // Update passenger stats
  await supabase.rpc("update_passenger_stats_on_complete" as never, { _passenger_id: ride.passenger_id, _price: pricePaid } as never).then(() => {});
  // Fallback: direct update if RPC doesn't exist
  const { data: passengerData } = await supabase
    .from("passengers")
    .select("total_rides, total_spent")
    .eq("id", ride.passenger_id)
    .single();

  if (passengerData) {
    await supabase.from("passengers").update({
      total_rides: passengerData.total_rides + 1,
      total_spent: passengerData.total_spent + pricePaid,
      last_ride_at: now,
    }).eq("id", ride.passenger_id);
  }

  await registrarAuditLog(
    ride.tenant_id,
    ride.driver_id,
    "RIDE_COMPLETED",
    "RIDE",
    rideId,
    { price_paid: pricePaid, is_transbordo: ride.is_transbordo }
  );
}

// ─── HTTP Handler ───

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, ride_request_id, dispatch_id, ride_id } = body;

    switch (action) {
      case "dispatch":
        if (!ride_request_id) throw new Error("ride_request_id required");
        await dispatchRide(ride_request_id);
        break;

      case "accept":
        if (!dispatch_id) throw new Error("dispatch_id required");
        await handleDriverResponse(dispatch_id, "accepted");
        break;

      case "reject":
        if (!dispatch_id) throw new Error("dispatch_id required");
        await handleDriverResponse(dispatch_id, "rejected");
        break;

      case "timeout_check":
        if (!ride_request_id) throw new Error("ride_request_id required");
        await handleTimeoutCheck(ride_request_id);
        break;

      case "timeout": {
        if (!dispatch_id) throw new Error("dispatch_id required");
        const { data: dispatch } = await supabase
          .from("ride_dispatches")
          .select("*")
          .eq("id", dispatch_id)
          .single();
        if (dispatch && dispatch.response === "pending") {
          await marcarDispatchTimeout(dispatch_id);
          await tryNextDriver(dispatch.ride_request_id, dispatch.tenant_id, dispatch.attempt_number);
        }
        break;
      }

      case "complete":
        if (!ride_id) throw new Error("ride_id required");
        await completeRide(ride_id);
        break;

      // Webhook trigger from database
      case "trigger": {
        const record = body.record;
        if (record && record.status === "pending") {
          await dispatchRide(record.id);
        }
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
