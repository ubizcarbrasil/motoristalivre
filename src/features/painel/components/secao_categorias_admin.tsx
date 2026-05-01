import { useEffect, useState } from "react";
import { Tag, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { atualizarCategoriasDriver } from "../services/servico_vitrine_admin";
import { SeletorCategoriasServico } from "./seletor_categorias_servico";
import {
  iconePorSlug,
  nomePorSlug,
} from "@/compartilhados/constants/constantes_categorias_servico";

interface Props {
  driverId: string;
}

const LIMITE = 10;

export function SecaoCategoriasAdmin({ driverId }: Props) {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [seletorAberto, setSeletorAberto] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const { data } = await supabase
        .from("drivers")
        .select("service_categories")
        .eq("id", driverId)
        .maybeSingle();
      if (!ativo) return;
      setCategorias((data?.service_categories as string[] | null) ?? []);
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
      toast.success("Categorias atualizadas");
    } catch {
      toast.error("Erro ao atualizar categorias");
    } finally {
      setSalvando(false);
    }
  };

  const remover = (slug: string) => {
    salvar(categorias.filter((c) => c !== slug));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Categorias da vitrine
        </h3>
        {salvando && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Mostre o que você faz. Aparece como chips no seu perfil público.
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={() => setSeletorAberto(true)}
        disabled={carregando || salvando}
        className="w-full h-11 gap-2"
      >
        <Plus className="w-4 h-4" />
        {categorias.length === 0
          ? "Selecionar categorias"
          : `Editar (${categorias.length}/${LIMITE})`}
      </Button>

      {carregando ? (
        <div className="rounded-xl bg-card border border-border p-4 flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : categorias.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhuma categoria. Selecione para destacar suas áreas de atuação.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {categorias.map((slug) => {
            const Icone = iconePorSlug(slug);
            return (
              <Badge
                key={slug}
                variant="outline"
                className="border-primary/40 text-primary bg-primary/5 gap-1.5 pl-2 pr-1 py-1 text-[11px]"
              >
                <Icone className="w-3 h-3" />
                {nomePorSlug(slug)}
                <button
                  type="button"
                  onClick={() => remover(slug)}
                  className="rounded-full hover:bg-primary/10 p-0.5"
                  aria-label={`Remover ${nomePorSlug(slug)}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <SeletorCategoriasServico
        aberto={seletorAberto}
        onFechar={() => setSeletorAberto(false)}
        selecionadas={categorias}
        onConfirmar={salvar}
        limite={LIMITE}
      />
    </div>
  );
}
