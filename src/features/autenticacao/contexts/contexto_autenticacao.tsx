import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { ContextoAutenticacaoTipo } from "../types/tipos_autenticacao";

export const ContextoAutenticacao = createContext<ContextoAutenticacaoTipo>({
  usuario: null,
  sessao: null,
  carregando: true,
});

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

export function ProvedorAutenticacao({ children }: ProvedorAutenticacaoProps) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

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
            }, 0);
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: sessaoAtual } }) => {
      setSessao(sessaoAtual);
      setUsuario(sessaoAtual?.user ?? null);
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ContextoAutenticacao.Provider value={{ usuario, sessao, carregando }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}
