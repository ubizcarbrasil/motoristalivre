import { useEffect, useState } from "react";
import { Tag, Plus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { atualizarCategoriasDriver } from "../services/servico_vitrine_admin";

interface Props {
  driverId: string;
}

export function SecaoCategoriasAdmin({ driverId }: Props) {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const { data } = await supabase
        .from("drivers")
        .select("service_categories")
        .eq("id", driverId)
        .maybeSingle();
      if (!ativo) return;
      setCategorias(((data as any)?.service_categories as string[]) ?? []);
      setCarregando(false);
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [driverId]);

  const salvar = async (lista: string[]) => {
    setSalvando(true);
    try {
      await atualizarCategoriasDriver(driverId, lista);
      setCategorias(lista);
    } catch {
      toast.error("Erro ao atualizar categorias");
    } finally {
      setSalvando(false);
    }
  };

  const adicionar = () => {
    const valor = novaCategoria.trim();
    if (!valor) return;
    if (categorias.some((c) => c.toLowerCase() === valor.toLowerCase())) {
      toast.error("Categoria já adicionada");
      return;
    }
    if (categorias.length >= 10) {
      toast.error("Máximo de 10 categorias");
      return;
    }
    salvar([...categorias, valor]);
    setNovaCategoria("");
  };

  const remover = (cat: string) => {
    salvar(categorias.filter((c) => c !== cat));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Categorias da vitrine</h3>
        {salvando && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Aparecem como chips no seu perfil público. Use termos curtos como "Beleza", "Saúde", "Reformas".
      </p>

      <div className="flex gap-2">
        <Input
          placeholder="Nova categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          maxLength={30}
          className="h-10"
        />
        <Button
          type="button"
          size="sm"
          onClick={adicionar}
          disabled={!novaCategoria.trim() || salvando}
          className="gap-1.5 h-10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </Button>
      </div>

      {carregando ? (
        <div className="rounded-xl bg-card border border-border p-4 flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : categorias.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhuma categoria. Adicione para destacar suas áreas de atuação.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {categorias.map((c) => (
            <Badge
              key={c}
              variant="outline"
              className="border-primary/40 text-primary bg-primary/5 gap-1.5 pl-2.5 pr-1 py-0.5 text-[11px]"
            >
              {c}
              <button
                type="button"
                onClick={() => remover(c)}
                className="rounded-full hover:bg-primary/10 p-0.5"
                aria-label={`Remover ${c}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
