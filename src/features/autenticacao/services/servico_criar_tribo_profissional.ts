import { supabase } from "@/integrations/supabase/client";
import { obterCategoriaPendente, limparCategoriaPendente } from "@/features/cadastro_por_categoria/utils/categoria_pendente";
import { resolverSlugCategoriaDb } from "@/features/cadastro_por_categoria/utils/mapa_categorias_db";
import { buscarIdCategoriaPorSlug } from "@/features/cadastro_por_categoria/services/servico_categorias_db";

/**
 * Cria a tribo principal do profissional autônomo. Idempotente.
 *
 * - Sempre cria a tribo (mesmo sem associados ainda) com signup_slug pronto
 *   para recrutar profissionais por link.
 * - Usa a categoria salva em localStorage (cadastro vindo de /s/cadastrar/:categoria)
 *   ou cai em "outros".
 * - Se o usuário já tem tenant, garante o setup (categoria + signup_slug) sem duplicar.
 */
export async function criarTriboProfissional(nomeUsuario: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const categoriaPendenteUi = obterCategoriaPendente();
  const slugDb = resolverSlugCategoriaDb(categoriaPendenteUi);
  const idCategoriaDb = await buscarIdCategoriaPorSlug(slugDb);

  // Já tem tenant? Só garante setup.
  const { data: usuarioExistente } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  if (usuarioExistente?.tenant_id) {
    await supabase
      .from("tenants")
      .update({ active_modules: ["services"] } as any)
      .eq("id", usuarioExistente.tenant_id);
    await garantirDriverServiceProvider(usuarioExistente.tenant_id);
    if (idCategoriaDb) {
      await chamarSetupTribo(usuarioExistente.tenant_id, idCategoriaDb);
    }
    limparCategoriaPendente();
    return usuarioExistente.tenant_id;
  }

  const nomeBase = (nomeUsuario || user.email?.split("@")[0] || "profissional").trim();
  const slug = await gerarSlugUnico(nomeBase);

  const { data: tenantId, error: erroTenant } = await supabase.rpc(
    "create_tenant_with_owner" as any,
    { _name: nomeBase, _slug: slug, _plan_id: null },
  );
  if (erroTenant || !tenantId) {
    throw erroTenant || new Error("Erro ao criar espaço do profissional");
  }

  await supabase
    .from("tenants")
    .update({ active_modules: ["services"] } as any)
    .eq("id", tenantId);

  await supabase.from("tenant_branding").insert({ tenant_id: tenantId });
  await supabase.from("tenant_settings").insert({ tenant_id: tenantId });

  await garantirDriverServiceProvider(tenantId as string);

  if (idCategoriaDb) {
    await chamarSetupTribo(tenantId as string, idCategoriaDb);
  }

  limparCategoriaPendente();
  return tenantId as string;
}

async function chamarSetupTribo(tenantId: string, categoriaId: string): Promise<void> {
  const { error } = await supabase.rpc("fn_setup_tribe_for_owner" as any, {
    _tenant_id: tenantId,
    _service_category_id: categoriaId,
  });
  if (error) {
    // Não bloqueia o cadastro — categoria pode ser ajustada depois no painel.
    // eslint-disable-next-line no-console
    console.warn("[criarTriboProfissional] fn_setup_tribe_for_owner falhou", error);
  }
}

async function garantirDriverServiceProvider(tenantId: string): Promise<void> {
  const { data: driverId, error } = await supabase.rpc(
    "ensure_driver_profile" as any,
    { _tenant_id: tenantId },
  );
  if (error || !driverId) return;

  await supabase
    .from("drivers")
    .update({ professional_type: "service_provider" } as any)
    .eq("id", driverId as string);
}

async function gerarSlugUnico(nome: string): Promise<string> {
  const base = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "profissional";

  let candidato = base;
  let tentativa = 0;
  while (tentativa < 20) {
    const { data } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", candidato)
      .maybeSingle();
    if (!data) return candidato;
    tentativa += 1;
    candidato = `${base}-${tentativa + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
