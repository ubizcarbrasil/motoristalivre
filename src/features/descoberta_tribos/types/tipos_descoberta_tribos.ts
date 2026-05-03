export interface TriboPublicaListada {
  id: string;
  slug: string;
  name: string;
  signupSlug: string | null;
  activeModules: string[];
  city: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
}

export interface FiltrosDescobertaTribos {
  busca?: string;
  categoriaSlug?: string;
  cidade?: string;
  limite?: number;
}

export interface CategoriaFiltro {
  id: string;
  slug: string;
  nome: string;
}
