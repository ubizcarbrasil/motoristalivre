import { useContext } from "react";
import { ContextoAutenticacao } from "../contexts/contexto_autenticacao";

export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error("useAutenticacao deve ser usado dentro de ProvedorAutenticacao");
  }
  return contexto;
}
