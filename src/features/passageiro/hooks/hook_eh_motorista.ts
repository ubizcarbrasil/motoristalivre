import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica se o usuário autenticado é motorista e/ou dono de tenant.
 * Retorna também a rota de retorno apropriada para o "Painel" no app de corridas.
 */
export function useEhMotorista() {
  const [ehMotorista, setEhMotorista] = useState(false);
  const [ehDono, setEhDono] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const verificar = async () => {
      const { data: sessao } = await supabase.auth.getSession();
      const userId = sessao.session?.user.id;
      if (!userId) {
        if (ativo) {
          setEhMotorista(false);
          setEhDono(false);
          setCarregando(false);
        }
        return;
      }

      const [{ data: motoristaData }, { data: tenantDono }] = await Promise.all([
        supabase.from("drivers").select("id").eq("id", userId).maybeSingle(),
        supabase.from("tenants").select("id").eq("owner_user_id", userId).maybeSingle(),
      ]);

      if (ativo) {
        setEhMotorista(Boolean(motoristaData));
        setEhDono(Boolean(tenantDono));
        setCarregando(false);
      }
    };

    verificar();
    return () => {
      ativo = false;
    };
  }, []);

  // Dono tem prioridade: volta para /admin. Motorista comum: /painel.
  const rotaPainel = ehDono ? "/admin" : "/painel";
  const mostrarBotaoPainel = ehDono || ehMotorista;

  return { ehMotorista, ehDono, mostrarBotaoPainel, rotaPainel, carregando };
}
