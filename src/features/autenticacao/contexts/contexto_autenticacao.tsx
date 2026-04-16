import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { ContextoAutenticacaoTipo } from "../types/tipos_autenticacao";

export const ContextoAutenticacao = createContext<ContextoAutenticacaoTipo>({
  usuario: null,
  sessao: null,
  carregando: true,
  temTenant: null,
});

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

export function ProvedorAutenticacao({ children }: ProvedorAutenticacaoProps) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [temTenant, setTemTenant] = useState<boolean | null>(null);

  async function verificarTenant(userId: string) {
    const { data } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();
    setTemTenant(!!data?.tenant_id);
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_evento, sessaoAtual) => {
        setSessao(sessaoAtual);
        setUsuario(sessaoAtual?.user ?? null);
        setCarregando(false);

        if (sessaoAtual?.user) {
          const slug = localStorage.getItem("tribocar_tenant_slug");
          if (slug) {
            localStorage.removeItem("tribocar_tenant_slug");
            setTimeout(async () => {
              await supabase.rpc("ensure_user_profile", { _tenant_slug: slug });
              verificarTenant(sessaoAtual.user.id);
            }, 0);
          } else {
            setTimeout(() => verificarTenant(sessaoAtual.user.id), 0);
          }
        } else {
          setTemTenant(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: sessaoAtual } }) => {
      setSessao(sessaoAtual);
      setUsuario(sessaoAtual?.user ?? null);
      setCarregando(false);
      if (sessaoAtual?.user) {
        verificarTenant(sessaoAtual.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ContextoAutenticacao.Provider value={{ usuario, sessao, carregando, temTenant }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}
