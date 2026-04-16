import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { criarPersonas, loginComoPersona } from "../services/servico_personas";
import type { Persona, ResultadoSeed } from "../types/tipos_personas";

export function useDevPersonas() {
  const [criando, setCriando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSeed | null>(null);
  const [logando, setLogando] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleCriar() {
    setCriando(true);
    try {
      const r = await criarPersonas();
      setResultado(r);
      if (r.ok) {
        toast.success("Personas prontas para uso");
      } else {
        toast.error(r.error ?? "Erro ao criar personas");
      }
    } catch (e) {
      toast.error("Erro inesperado");
    } finally {
      setCriando(false);
    }
  }

  async function handleLogin(persona: Persona) {
    setLogando(persona.email);
    try {
      try {
        await loginComoPersona(persona);
      } catch {
        // Personas ainda não criadas: dispara seed e tenta de novo
        toast.info("Criando personas pela primeira vez...");
        const r = await criarPersonas();
        setResultado(r);
        if (!r.ok) throw new Error(r.error ?? "Falha ao criar personas");
        await loginComoPersona(persona);
      }
      toast.success(`Logado como ${persona.titulo}`);
      navigate(persona.rotaDestino);
    } catch (e) {
      toast.error(
        "Falha no login. Clique em 'Criar/Recriar personas' primeiro."
      );
    } finally {
      setLogando(null);
    }
  }

  function copiarCredenciais(persona: Persona) {
    const texto = `Email: ${persona.email}\nSenha: ${persona.senha}\nRota: ${persona.rotaDestino}`;
    navigator.clipboard.writeText(texto);
    toast.success("Credenciais copiadas");
  }

  return {
    criando,
    resultado,
    logando,
    handleCriar,
    handleLogin,
    copiarCredenciais,
  };
}
