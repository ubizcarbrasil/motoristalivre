import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica se o usuário autenticado também tem perfil de motorista.
 * Faz uma única consulta ao montar.
 */
export function useEhMotorista() {
  const [ehMotorista, setEhMotorista] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const verificar = async () => {
      const { data: sessao } = await supabase.auth.getSession();
      const userId = sessao.session?.user.id;
      if (!userId) {
        if (ativo) {
          setEhMotorista(false);
          setCarregando(false);
        }
        return;
      }

      const { data } = await supabase
        .from("drivers")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (ativo) {
        setEhMotorista(Boolean(data));
        setCarregando(false);
      }
    };

    verificar();
    return () => {
      ativo = false;
    };
  }, []);

  return { ehMotorista, carregando };
}
