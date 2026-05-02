import { CATEGORIAS_SERVICO } from "@/compartilhados/constants/constantes_categorias_servico";

/**
 * Resolve o nome amigável (pt-BR) de uma categoria/subcategoria a partir do
 * id armazenado em `drivers.service_categories`. Faz fallback para o slug
 * humanizado caso o id não esteja no catálogo.
 */
export function resolverNomeCategoria(id: string): string {
  if (!id) return "";

  for (const categoria of CATEGORIAS_SERVICO) {
    if (categoria.id === id) return categoria.nome;
    const sub = categoria.subcategorias.find((s) => s.id === id);
    if (sub) return sub.nome;
  }

  // Fallback: humaniza kebab/snake case
  return id
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
