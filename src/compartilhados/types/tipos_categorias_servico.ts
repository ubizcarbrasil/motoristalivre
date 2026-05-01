import type { LucideIcon } from "lucide-react";

export interface SubcategoriaServico {
  id: string;
  nome: string;
  icone: LucideIcon;
  grupo?: string;
  destaque?: boolean;
}

export interface CategoriaServico {
  id: string;
  nome: string;
  icone: LucideIcon;
  destaque?: boolean;
  subcategorias: SubcategoriaServico[];
}

export interface SubcategoriaResolvida {
  subcategoria: SubcategoriaServico;
  categoria: CategoriaServico;
}
