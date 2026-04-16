// Edge function temporária: reverte nomes no índice e move blobs físicos via Storage API
// para a estrutura {tenant_id}/{pasta}/{arquivo}. Atualiza tenant_branding ao final.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MoveItem {
  id: string;
  tenant_id: string;
  pasta: "logos" | "capas";
  arquivo: string;
  campo: "logo_url" | "cover_url";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const baseUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/branding/`;
  const itens: MoveItem[] = [
    {
      id: "2e395ead-7343-445e-920b-fa176fd1f1e2",
      tenant_id: "c543a569-e034-4024-9ba9-711e7291dcae",
      pasta: "logos",
      arquivo: "26b2f68f-8462-4728-affd-6e3a75dde7be.png",
      campo: "logo_url",
    },
    {
      id: "167f755b-e7c9-4593-ae02-adb44bb81653",
      tenant_id: "c543a569-e034-4024-9ba9-711e7291dcae",
      pasta: "capas",
      arquivo: "da0f4549-6929-422c-a01f-0c763f3d305a.png",
      campo: "cover_url",
    },
  ];

  const resultado: Record<string, unknown>[] = [];

  for (const item of itens) {
    const nomeAntigo = `${item.pasta}/${item.arquivo}`;
    const nomeNovo = `${item.tenant_id}/${item.pasta}/${item.arquivo}`;

    // 1) Reverter o name no índice para o caminho original (onde o blob físico está)
    const { error: revertError } = await supabase
      .schema("storage" as never)
      .from("objects" as never)
      // @ts-ignore – tabela não tipada
      .update({ name: nomeAntigo })
      .eq("id", item.id);

    // Como acima pode falhar por restrição do PostgREST no schema storage,
    // usamos rpc/raw via fetch direto ao postgrest? Em vez disso, tentamos move direto.
    // Se o name no índice ainda for o "novo" mas o blob estiver no antigo, o move falha.
    // Estratégia alternativa: usar SQL direto via função RPC seria ideal, mas vamos tentar move primeiro.

    // 2) Tentar move do caminho antigo para o novo
    const { data: moveData, error: moveError } = await supabase.storage
      .from("branding")
      .move(nomeAntigo, nomeNovo);

    resultado.push({
      item: nomeNovo,
      revertError: revertError?.message ?? null,
      moveData,
      moveError: moveError?.message ?? null,
    });

    if (!moveError) {
      const novaUrl = baseUrl + nomeNovo;
      await supabase
        .from("tenant_branding")
        .update({ [item.campo]: novaUrl, updated_at: new Date().toISOString() })
        .eq("tenant_id", item.tenant_id);
    }
  }

  return new Response(JSON.stringify({ ok: true, resultado }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
