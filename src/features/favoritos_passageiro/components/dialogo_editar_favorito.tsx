import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { BuscadorEnderecoSimples } from "./buscador_endereco_simples";
import { IconeFavorito } from "./icone_favorito";
import { ROTULOS_TIPO_FAVORITO, type FavoritoEndereco, type NovoFavoritoEndereco, type TipoFavorito } from "../types/tipos_favoritos";

interface DialogoEditarFavoritoProps {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (dados: NovoFavoritoEndereco) => Promise<boolean>;
  favoritoExistente?: FavoritoEndereco | null;
  enderecoInicial?: { address: string; lat: number; lng: number } | null;
  tipoSugerido?: TipoFavorito;
}

const TIPOS: TipoFavorito[] = ["home", "work", "other"];

export function DialogoEditarFavorito({
  aberto,
  onFechar,
  onSalvar,
  favoritoExistente,
  enderecoInicial,
  tipoSugerido,
}: DialogoEditarFavoritoProps) {
  const [tipo, setTipo] = useState<TipoFavorito>("other");
  const [rotulo, setRotulo] = useState("");
  const [endereco, setEndereco] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    if (favoritoExistente) {
      setTipo(favoritoExistente.type);
      setRotulo(favoritoExistente.label);
      setEndereco({
        address: favoritoExistente.address,
        lat: favoritoExistente.lat,
        lng: favoritoExistente.lng,
      });
    } else {
      const tipoInicial = tipoSugerido ?? "other";
      setTipo(tipoInicial);
      setRotulo(tipoInicial === "other" ? "" : ROTULOS_TIPO_FAVORITO[tipoInicial]);
      setEndereco(enderecoInicial ?? null);
    }
  }, [aberto, favoritoExistente, enderecoInicial, tipoSugerido]);

  const handleMudarTipo = (novoTipo: TipoFavorito) => {
    setTipo(novoTipo);
    if (novoTipo !== "other" && (!rotulo || TIPOS.some((t) => ROTULOS_TIPO_FAVORITO[t] === rotulo))) {
      setRotulo(ROTULOS_TIPO_FAVORITO[novoTipo]);
    }
  };

  const podeSalvar = endereco !== null && rotulo.trim().length > 0 && !salvando;

  const handleSalvar = async () => {
    if (!endereco || !rotulo.trim()) return;
    setSalvando(true);
    const ok = await onSalvar({
      type: tipo,
      label: rotulo.trim(),
      address: endereco.address,
      lat: endereco.lat,
      lng: endereco.lng,
    });
    setSalvando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{favoritoExistente ? "Editar favorito" : "Novo favorito"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => {
                const ativo = tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleMudarTipo(t)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-colors ${
                      ativo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <IconeFavorito type={t} className="w-4 h-4" />
                    <span className="text-[11px] font-medium">{ROTULOS_TIPO_FAVORITO[t]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rotulo-favorito" className="text-xs text-muted-foreground">
              Nome
            </Label>
            <Input
              id="rotulo-favorito"
              value={rotulo}
              onChange={(e) => setRotulo(e.target.value)}
              placeholder="Ex: Casa, Trabalho, Academia"
              maxLength={40}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Endereço</Label>
            {endereco && (
              <div className="bg-secondary rounded-lg px-3 py-2 text-xs text-foreground line-clamp-2">
                {endereco.address}
              </div>
            )}
            <BuscadorEnderecoSimples
              onSelecionar={(r) => setEndereco({ address: r.endereco, lat: r.lat, lng: r.lng })}
              placeholder={endereco ? "Trocar endereço" : "Buscar endereço"}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={!podeSalvar}>
            {salvando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
