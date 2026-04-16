import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENHA_PADRAO = "Tribo@2025";
const TENANT_SLUG = "demo";
const TENANT_NOME = "TriboCar Demo";

interface Persona {
  email: string;
  role: "root_admin" | "tenant_admin" | "manager" | "driver" | "affiliate" | "passenger";
  fullName: string;
}

const PERSONAS: Persona[] = [
  { email: "root@tribocar.test", role: "root_admin", fullName: "Root Admin" },
  { email: "admin@tribocar.test", role: "tenant_admin", fullName: "Admin do Grupo" },
  { email: "manager@tribocar.test", role: "manager", fullName: "Gestor do Grupo" },
  { email: "motorista@tribocar.test", role: "driver", fullName: "Motorista Demo" },
  { email: "afiliado@tribocar.test", role: "affiliate", fullName: "Afiliado Demo" },
  { email: "passageiro@tribocar.test", role: "passenger", fullName: "Passageiro Demo" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resultado: Array<{ email: string; status: string; userId?: string }> = [];

    // 1. Garantir tenant demo
    let tenantId: string;
    const { data: tenantExistente } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", TENANT_SLUG)
      .maybeSingle();

    if (tenantExistente) {
      tenantId = tenantExistente.id;
    } else {
      const { data: novoTenant, error: errTenant } = await supabase
        .from("tenants")
        .insert({ name: TENANT_NOME, slug: TENANT_SLUG, status: "active" })
        .select("id")
        .single();
      if (errTenant) throw errTenant;
      tenantId = novoTenant.id;
    }

    // 2. Garantir branding e settings
    await supabase.from("tenant_branding").upsert(
      {
        tenant_id: tenantId,
        primary_color: "#1db865",
        description: "Tenant de demonstração",
        city: "São Paulo",
      },
      { onConflict: "tenant_id" }
    );

    await supabase.from("tenant_settings").upsert(
      { tenant_id: tenantId },
      { onConflict: "tenant_id" }
    );

    // 3. Criar cada persona
    for (const persona of PERSONAS) {
      // Buscar se já existe no auth
      const { data: lista } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const existente = lista?.users?.find((u) => u.email === persona.email);

      let userId: string;
      if (existente) {
        userId = existente.id;
        resultado.push({ email: persona.email, status: "ja_existia", userId });
      } else {
        const { data: novo, error: errUser } = await supabase.auth.admin.createUser({
          email: persona.email,
          password: SENHA_PADRAO,
          email_confirm: true,
          user_metadata: {
            full_name: persona.fullName,
            tenant_slug: TENANT_SLUG,
            role: persona.role,
          },
        });
        if (errUser) {
          resultado.push({ email: persona.email, status: `erro: ${errUser.message}` });
          continue;
        }
        userId = novo.user!.id;
        resultado.push({ email: persona.email, status: "criado", userId });
      }

      // Upsert na tabela public.users com role correto
      await supabase.from("users").upsert(
        {
          id: userId,
          tenant_id: tenantId,
          role: persona.role,
          full_name: persona.fullName,
          email: persona.email,
          status: "active",
        },
        { onConflict: "id" }
      );

      // Dados específicos por role
      if (persona.role === "driver") {
        await supabase.from("drivers").upsert(
          {
            id: userId,
            tenant_id: tenantId,
            slug: "motorista-demo",
            is_verified: true,
            is_online: true,
            vehicle_model: "Honda Civic",
            vehicle_color: "Preto",
            vehicle_year: 2022,
            vehicle_plate: "DEM0A01",
            bio: "Motorista de demonstração",
          },
          { onConflict: "id" }
        );
      }

      if (persona.role === "affiliate") {
        await supabase.from("affiliates").upsert(
          {
            id: userId,
            tenant_id: tenantId,
            slug: "afiliado-demo",
            is_approved: true,
            business_name: "Afiliado Demo Ltda",
            business_type: "comercio",
          },
          { onConflict: "id" }
        );
      }

      if (persona.role === "passenger") {
        await supabase.from("passengers").upsert(
          {
            id: userId,
            tenant_id: tenantId,
          },
          { onConflict: "id" }
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        tenant: { id: tenantId, slug: TENANT_SLUG },
        personas: resultado,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("seed-personas error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
