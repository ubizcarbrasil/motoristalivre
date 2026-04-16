import type { User, Session } from "@supabase/supabase-js";

export interface ContextoAutenticacaoTipo {
  usuario: User | null;
  sessao: Session | null;
  carregando: boolean;
}
