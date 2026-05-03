import { supabase } from "@/integrations/supabase/client";

let cache: Map<string, string> | null = null;

/**
 * Busca o id da service_categories pelo slug (estetica, beleza, ...).
 * Retorna null se não encontrado. Faz cache em memória.
 */
export async function buscarIdCategoriaPorSlug(slug: string): Promise<string | null> {
  if (cache) {
    return cache.get(slug) ?? null;
  }

  const { data, error } = await supabase
    .from("service_categories")
    .select("id, slug")
    .eq("ativo", true);

  if (error || !data) return null;

  cache = new Map();
  for (const linha of data) {
    if (linha.slug) cache.set(linha.slug, linha.id);
  }
  return cache.get(slug) ?? null;
}
