import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLogout() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta");
    navigate("/entrar");
  }

  return { sair };
}
