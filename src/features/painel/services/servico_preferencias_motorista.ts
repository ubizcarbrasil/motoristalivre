import { supabase } from "@/integrations/supabase/client";
import type { TipoSomChamada } from "../utils/audio_alerta";

const SONS_VALIDOS: TipoSomChamada[] = ["suave", "padrao", "sirene"];

function normalizar(valor: unknown): TipoSomChamada {
  return SONS_VALIDOS.includes(valor as TipoSomChamada) ? (valor as TipoSomChamada) : "padrao";
}

/**
 * Busca a preferência de som do motorista no banco.
 * Retorna "padrao" se não houver registro ou em caso de erro.
 */
export async function buscarSomMotorista(driverId: string): Promise<TipoSomChamada> {
  const { data, error } = await supabase
    .from("drivers")
    .select("alert_sound")
    .eq("id", driverId)
    .maybeSingle();

  if (error || !data) return "padrao";
  return normalizar((data as { alert_sound?: string }).alert_sound);
}

/**
 * Atualiza a preferência de som do motorista no banco.
 * Falha silenciosa — o localStorage continua funcionando como fallback.
 */
export async function salvarSomMotorista(
  driverId: string,
  som: TipoSomChamada,
): Promise<boolean> {
  const { error } = await supabase
    .from("drivers")
    .update({ alert_sound: som })
    .eq("id", driverId);
  return !error;
}
