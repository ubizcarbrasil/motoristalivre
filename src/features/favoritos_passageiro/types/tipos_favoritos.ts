export type TipoFavorito = "home" | "work" | "other";

export interface FavoritoEndereco {
  id: string;
  passenger_id: string;
  tenant_id: string;
  type: TipoFavorito;
  label: string;
  address: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
}

export interface NovoFavoritoEndereco {
  type: TipoFavorito;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export const ROTULOS_TIPO_FAVORITO: Record<TipoFavorito, string> = {
  home: "Casa",
  work: "Trabalho",
  other: "Outro",
};
