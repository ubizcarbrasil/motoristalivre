import { supabase } from "@/integrations/supabase/client";
import type { CategoriaServico, TemplateOrcamento, PerguntaOrcamento } from "../types/tipos_orcamento";

export async function listarCategoriasAtivas(): Promise<CategoriaServico[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, slug, nome, icone, descricao, ativo, ordem")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoriaServico[];
}

export async function buscarTemplatePorCategoria(categoryId: string): Promise<TemplateOrcamento | null> {
  const { data: tpl, error } = await supabase
    .from("service_quote_templates")
    .select("*")
    .eq("category_id", categoryId)
    .eq("ativo", true)
    .eq("scope", "category")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!tpl) return null;

  const { data: perguntas, error: errP } = await supabase
    .from("service_quote_questions")
    .select("*")
    .eq("template_id", tpl.id)
    .order("ordem", { ascending: true });
  if (errP) throw errP;

  return {
    id: tpl.id,
    scope: tpl.scope as "category" | "service_type",
    category_id: tpl.category_id,
    service_type_id: tpl.service_type_id,
    nome: tpl.nome,
    descricao: tpl.descricao,
    ativo: tpl.ativo,
    perguntas: (perguntas ?? []) as unknown as PerguntaOrcamento[],
  };
}
