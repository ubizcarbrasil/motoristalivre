import { supabase } from "@/integrations/supabase/client";
import type { Persona, ResultadoSeed } from "../types/tipos_personas";

export async function criarPersonas(): Promise<ResultadoSeed> {
  const { data, error } = await supabase.functions.invoke("seed-personas", {
    body: {},
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return data as ResultadoSeed;
}

export async function loginComoPersona(persona: Persona): Promise<void> {
  // Garante que não há sessão antiga
  await supabase.auth.signOut();
  const { error } = await supabase.auth.signInWithPassword({
    email: persona.email,
    password: persona.senha,
  });
  if (error) throw error;
}
