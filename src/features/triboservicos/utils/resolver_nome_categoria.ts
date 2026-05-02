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

/**
 * Ordena ids de service_categories: primeiro categorias principais (na ordem
 * do catálogo), depois subcategorias agrupadas pela categoria-mãe (também
 * na ordem do catálogo). Ids desconhecidos vão para o final, ordenados
 * alfabeticamente pelo nome resolvido.
 */
export function ordenarCategoriasServico(ids: string[]): string[] {
  if (!ids || ids.length === 0) return [];

  const indicesCategoria = new Map<string, number>();
  const indicesSubcategoria = new Map<string, { cat: number; sub: number }>();

  CATEGORIAS_SERVICO.forEach((cat, iCat) => {
    indicesCategoria.set(cat.id, iCat);
    cat.subcategorias.forEach((sub, iSub) => {
      indicesSubcategoria.set(sub.id, { cat: iCat, sub: iSub });
    });
  });

  type Bucket = "principal" | "subcategoria" | "desconhecido";
  const peso: Record<Bucket, number> = {
    principal: 0,
    subcategoria: 1,
    desconhecido: 2,
  };

  return [...ids].sort((a, b) => {
    const aPrincipal = indicesCategoria.get(a);
    const bPrincipal = indicesCategoria.get(b);
    const aSub = indicesSubcategoria.get(a);
    const bSub = indicesSubcategoria.get(b);

    const bucketA: Bucket =
      aPrincipal !== undefined ? "principal" : aSub ? "subcategoria" : "desconhecido";
    const bucketB: Bucket =
      bPrincipal !== undefined ? "principal" : bSub ? "subcategoria" : "desconhecido";

    if (bucketA !== bucketB) return peso[bucketA] - peso[bucketB];

    if (bucketA === "principal") return (aPrincipal ?? 0) - (bPrincipal ?? 0);
    if (bucketA === "subcategoria") {
      if (aSub!.cat !== bSub!.cat) return aSub!.cat - bSub!.cat;
      return aSub!.sub - bSub!.sub;
    }
    return resolverNomeCategoria(a).localeCompare(resolverNomeCategoria(b), "pt-BR");
  });
}
