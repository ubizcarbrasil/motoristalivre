import { supabase } from "@/integrations/supabase/client";
import type { FavoritoEndereco, NovoFavoritoEndereco, TipoFavorito } from "../types/tipos_favoritos";

export async function listarFavoritos(passengerId: string): Promise<FavoritoEndereco[]> {
  const { data, error } = await supabase
    .from("passenger_favorites")
    .select("*")
    .eq("passenger_id", passengerId)
    .order("type", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as FavoritoEndereco[];
}

export async function criarFavorito(
  passengerId: string,
  tenantId: string,
  novo: NovoFavoritoEndereco
): Promise<FavoritoEndereco> {
  const { data, error } = await supabase
    .from("passenger_favorites")
    .insert({
      passenger_id: passengerId,
      tenant_id: tenantId,
      type: novo.type,
      label: novo.label,
      address: novo.address,
      lat: novo.lat,
      lng: novo.lng,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FavoritoEndereco;
}

export async function atualizarFavorito(
  id: string,
  alteracoes: Partial<Pick<FavoritoEndereco, "label" | "address" | "lat" | "lng" | "type">>
): Promise<void> {
  const { error } = await supabase
    .from("passenger_favorites")
    .update(alteracoes)
    .eq("id", id);
  if (error) throw error;
}

export async function removerFavorito(id: string): Promise<void> {
  const { error } = await supabase
    .from("passenger_favorites")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function buscarFavoritoExistente(
  passengerId: string,
  type: TipoFavorito
): Promise<FavoritoEndereco | null> {
  if (type === "other") return null;
  const { data, error } = await supabase
    .from("passenger_favorites")
    .select("*")
    .eq("passenger_id", passengerId)
    .eq("type", type)
    .maybeSingle();

  if (error) throw error;
  return (data as FavoritoEndereco | null) ?? null;
}
