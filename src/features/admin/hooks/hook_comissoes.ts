import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import {
  buscarComissoesTenant,
  salvarComissoesTenant,
} from "../services/servico_comissoes";
import { schemaComissoes } from "../schemas/schema_comissoes";
import type { ComissoesTenant } from "../types/tipos_comissoes";

const PADRAO: ComissoesTenant = {
  transbordo_commission: 10,
  affiliate_commission: 5,
  cashback_pct: 0,
};

export function useHookComissoes() {
  const { usuario } = useAutenticacao();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [valores, setValores] = useState<ComissoesTenant>(PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;

    (async () => {
      setCarregando(true);
      try {
        const { data: perfil } = await supabase
          .from("users")
          .select("tenant_id")
          .eq("id", usuario.id)
          .maybeSingle();

        if (!perfil?.tenant_id || cancelado) return;
        setTenantId(perfil.tenant_id);

        const dados = await buscarComissoesTenant(perfil.tenant_id);
        if (!cancelado) setValores(dados);
      } catch (erro) {
        if (!cancelado) toast.error("Erro ao carregar comissões");
        console.error("[useHookComissoes] erro ao carregar:", erro);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [usuario]);

  const atualizarCampo = useCallback(
    <Campo extends keyof ComissoesTenant>(campo: Campo, valor: number) => {
      setValores((atual) => ({ ...atual, [campo]: valor }));
    },
    [],
  );

  const salvar = useCallback(async () => {
    if (!tenantId) return;

    const validacao = schemaComissoes.safeParse(valores);
    if (!validacao.success) {
      const primeiroErro = validacao.error.issues[0]?.message ?? "Valores inválidos";
      toast.error(primeiroErro);
      return;
    }

    setSalvando(true);
    try {
      await salvarComissoesTenant(tenantId, {
        transbordo_commission: validacao.data.transbordo_commission,
        affiliate_commission: validacao.data.affiliate_commission,
        cashback_pct: validacao.data.cashback_pct,
      });
      toast.success("Comissões atualizadas");
    } catch (erro) {
      console.error("[useHookComissoes] erro ao salvar:", erro);
      toast.error("Erro ao salvar comissões");
    } finally {
      setSalvando(false);
    }
  }, [tenantId, valores]);

  return {
    valores,
    atualizarCampo,
    salvar,
    carregando,
    salvando,
  };
}
