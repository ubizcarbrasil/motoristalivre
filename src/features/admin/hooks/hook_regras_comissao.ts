import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import {
  atualizarRegraComissao,
  criarRegraComissao,
  listarCategoriasAtivas,
  listarRegrasTenant,
  removerRegraComissao,
} from "../services/servico_regras_comissao";
import type {
  CategoriaServico,
  PayloadRegraComissao,
  RegraComissaoComCategoria,
} from "../types/tipos_regras_comissao";

export function useHookRegrasComissao() {
  const { usuario } = useAutenticacao();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaServico[]>([]);
  const [regras, setRegras] = useState<RegraComissaoComCategoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const recarregar = useCallback(async (tid: string) => {
    const [cats, rgs] = await Promise.all([
      listarCategoriasAtivas(),
      listarRegrasTenant(tid),
    ]);
    setCategorias(cats);
    setRegras(rgs);
  }, []);

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
        await recarregar(perfil.tenant_id);
      } catch (erro) {
        console.error("[useHookRegrasComissao] erro:", erro);
        if (!cancelado) toast.error("Erro ao carregar regras de comissão");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [usuario, recarregar]);

  const criar = useCallback(
    async (payload: PayloadRegraComissao) => {
      if (!tenantId) return;
      setSalvando(true);
      try {
        await criarRegraComissao(tenantId, payload);
        await recarregar(tenantId);
        toast.success("Regra criada");
      } catch (erro) {
        console.error("[criar regra]", erro);
        toast.error("Erro ao criar regra (categoria já configurada?)");
      } finally {
        setSalvando(false);
      }
    },
    [tenantId, recarregar],
  );

  const atualizar = useCallback(
    async (id: string, payload: PayloadRegraComissao) => {
      if (!tenantId) return;
      setSalvando(true);
      try {
        await atualizarRegraComissao(id, payload);
        await recarregar(tenantId);
        toast.success("Regra atualizada");
      } catch (erro) {
        console.error("[atualizar regra]", erro);
        toast.error("Erro ao atualizar regra");
      } finally {
        setSalvando(false);
      }
    },
    [tenantId, recarregar],
  );

  const remover = useCallback(
    async (id: string) => {
      if (!tenantId) return;
      setSalvando(true);
      try {
        await removerRegraComissao(id);
        await recarregar(tenantId);
        toast.success("Regra removida");
      } catch (erro) {
        console.error("[remover regra]", erro);
        toast.error("Erro ao remover regra");
      } finally {
        setSalvando(false);
      }
    },
    [tenantId, recarregar],
  );

  return {
    tenantId,
    categorias,
    regras,
    carregando,
    salvando,
    criar,
    atualizar,
    remover,
  };
}
