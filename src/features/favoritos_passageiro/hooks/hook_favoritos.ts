import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  atualizarFavorito,
  buscarFavoritoExistente,
  criarFavorito,
  listarFavoritos,
  removerFavorito,
} from "../services/servico_favoritos";
import type { FavoritoEndereco, NovoFavoritoEndereco, TipoFavorito } from "../types/tipos_favoritos";

interface UseFavoritosOptions {
  passengerId: string | null;
  tenantId: string | null;
}

export function useFavoritos({ passengerId, tenantId }: UseFavoritosOptions) {
  const [favoritos, setFavoritos] = useState<FavoritoEndereco[]>([]);
  const [carregando, setCarregando] = useState(false);

  const recarregar = useCallback(async () => {
    if (!passengerId) {
      setFavoritos([]);
      return;
    }
    setCarregando(true);
    try {
      const lista = await listarFavoritos(passengerId);
      setFavoritos(lista);
    } catch (e) {
      console.error("Erro ao carregar favoritos:", e);
    } finally {
      setCarregando(false);
    }
  }, [passengerId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const adicionar = useCallback(
    async (novo: NovoFavoritoEndereco): Promise<boolean> => {
      if (!passengerId || !tenantId) {
        toast.error("Você precisa estar logado para favoritar");
        return false;
      }

      // Se for casa ou trabalho, sobrescreve o existente
      if (novo.type === "home" || novo.type === "work") {
        try {
          const existente = await buscarFavoritoExistente(passengerId, novo.type);
          if (existente) {
            await atualizarFavorito(existente.id, {
              label: novo.label,
              address: novo.address,
              lat: novo.lat,
              lng: novo.lng,
            });
            await recarregar();
            toast.success(`${novo.label} atualizada`);
            return true;
          }
        } catch (e) {
          console.error(e);
        }
      }

      try {
        await criarFavorito(passengerId, tenantId, novo);
        await recarregar();
        toast.success("Endereço favoritado");
        return true;
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message ?? "Erro ao favoritar");
        return false;
      }
    },
    [passengerId, tenantId, recarregar]
  );

  const editar = useCallback(
    async (id: string, alteracoes: Partial<Pick<FavoritoEndereco, "label" | "address" | "lat" | "lng" | "type">>) => {
      try {
        await atualizarFavorito(id, alteracoes);
        await recarregar();
        toast.success("Favorito atualizado");
        return true;
      } catch (e: any) {
        toast.error(e?.message ?? "Erro ao atualizar");
        return false;
      }
    },
    [recarregar]
  );

  const remover = useCallback(
    async (id: string) => {
      try {
        await removerFavorito(id);
        await recarregar();
        toast.success("Favorito removido");
        return true;
      } catch (e: any) {
        toast.error(e?.message ?? "Erro ao remover");
        return false;
      }
    },
    [recarregar]
  );

  const eFavorito = useCallback(
    (lat: number, lng: number, address: string): FavoritoEndereco | undefined => {
      return favoritos.find(
        (f) =>
          (Math.abs(f.lat - lat) < 0.00001 && Math.abs(f.lng - lng) < 0.00001) ||
          f.address.toLowerCase() === address.toLowerCase()
      );
    },
    [favoritos]
  );

  const favoritosOrdenados = useMemo(() => {
    const ordem: Record<TipoFavorito, number> = { home: 0, work: 1, other: 2 };
    return [...favoritos].sort((a, b) => {
      if (ordem[a.type] !== ordem[b.type]) return ordem[a.type] - ordem[b.type];
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [favoritos]);

  return {
    favoritos: favoritosOrdenados,
    carregando,
    adicionar,
    editar,
    remover,
    recarregar,
    eFavorito,
  };
}
