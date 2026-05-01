export interface TriboDev {
  id: string;
  slug: string;
  name: string;
  modulos: string[];
  motoristaSlug: string | null;
}

export interface LinkItem {
  rotulo: string;
  url: string;
}
