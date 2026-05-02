import { useEffect, useState } from "react";
import {
  validarFormatoHandle,
  verificarDisponibilidadeHandle,
} from "../services/servico_handles";

export type EstadoValidacaoHandle =
  | "vazio"
  | "invalido"
  | "verificando"
  | "indisponivel"
  | "disponivel";

/**
 * Valida formato + disponibilidade de um handle com debounce de 400ms.
 */
export function useValidacaoHandle(
  handle: string,
  driverIdAtual?: string,
): { estado: EstadoValidacaoHandle } {
  const [estado, setEstado] = useState<EstadoValidacaoHandle>("vazio");

  useEffect(() => {
    const limpo = handle.replace(/^@/, "").trim().toLowerCase();
    if (!limpo) {
      setEstado("vazio");
      return;
    }
    if (!validarFormatoHandle(limpo)) {
      setEstado("invalido");
      return;
    }
    setEstado("verificando");
    const t = setTimeout(async () => {
      const ok = await verificarDisponibilidadeHandle(limpo, driverIdAtual);
      setEstado(ok ? "disponivel" : "indisponivel");
    }, 400);
    return () => clearTimeout(t);
  }, [handle, driverIdAtual]);

  return { estado };
}
