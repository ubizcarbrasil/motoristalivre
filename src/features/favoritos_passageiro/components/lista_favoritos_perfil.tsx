import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconeFavorito } from "./icone_favorito";
import { DialogoEditarFavorito } from "./dialogo_editar_favorito";
import { useFavoritos } from "../hooks/hook_favoritos";
import type { FavoritoEndereco } from "../types/tipos_favoritos";

interface ListaFavoritosPerfilProps {
  passengerId: string;
  tenantId: string | null;
}

export function ListaFavoritosPerfil({ passengerId, tenantId }: ListaFavoritosPerfilProps) {
  const { favoritos, carregando, adicionar, editar, remover } = useFavoritos({
    passengerId,
    tenantId,
  });
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<FavoritoEndereco | null>(null);
  const [removendo, setRemovendo] = useState<FavoritoEndereco | null>(null);

  const abrirNovo = () => {
    setEditando(null);
    setDialogoAberto(true);
  };

  const abrirEdicao = (f: FavoritoEndereco) => {
    setEditando(f);
    setDialogoAberto(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Endereços favoritos</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Acesse rapidamente ao pedir uma corrida
          </p>
        </div>
        <Button size="sm" onClick={abrirNovo} className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Novo
        </Button>
      </div>

      {carregando ? (
        <div className="text-xs text-muted-foreground py-4 text-center">Carregando...</div>
      ) : favoritos.length === 0 ? (
        <div className="bg-secondary rounded-lg px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhum endereço favorito ainda
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Salve Casa, Trabalho ou outros locais frequentes
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {favoritos.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 bg-secondary rounded-lg px-3 py-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <IconeFavorito type={f.type} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{f.label}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{f.address}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => abrirEdicao(f)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRemovendo(f)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogoEditarFavorito
        aberto={dialogoAberto}
        onFechar={() => {
          setDialogoAberto(false);
          setEditando(null);
        }}
        favoritoExistente={editando}
        onSalvar={async (dados) => {
          if (editando) {
            return editar(editando.id, {
              type: dados.type,
              label: dados.label,
              address: dados.address,
              lat: dados.lat,
              lng: dados.lng,
            });
          }
          return adicionar(dados);
        }}
      />

      <AlertDialog open={!!removendo} onOpenChange={(v) => !v && setRemovendo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover favorito?</AlertDialogTitle>
            <AlertDialogDescription>
              {removendo?.label} será removido da sua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (removendo) await remover(removendo.id);
                setRemovendo(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
