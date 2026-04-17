import { useEffect, useRef, useState, useCallback } from "react";
import { destravarAudio, tocarPadraoAlerta, vibrarPadrao } from "../utils/audio_alerta";

const CHAVE_MUTE = "tribocar_dispatch_mute";
const INTERVALO_NORMAL_MS = 2200;
const INTERVALO_INTENSO_MS = 1100;

interface Props {
  ativo: boolean;
  segundosRestantes?: number;
}

/**
 * Toca beep + vibra enquanto houver dispatch pendente.
 * Para automaticamente quando `ativo` vira false.
 * Respeita preferência salva no localStorage.
 */
export function useAlertaDispatch({ ativo, segundosRestantes }: Props) {
  const [silenciado, setSilenciadoState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CHAVE_MUTE) === "1";
  });
  const intervaloRef = useRef<number | null>(null);

  const setSilenciado = useCallback((valor: boolean) => {
    setSilenciadoState(valor);
    if (typeof window !== "undefined") {
      localStorage.setItem(CHAVE_MUTE, valor ? "1" : "0");
    }
  }, []);

  const alternarSilenciado = useCallback(() => {
    setSilenciado(!silenciado);
  }, [silenciado, setSilenciado]);

  // Destrava áudio em qualquer interação do usuário (necessário no iOS)
  useEffect(() => {
    const handler = () => {
      destravarAudio();
    };
    window.addEventListener("pointerdown", handler, { once: false, passive: true });
    window.addEventListener("keydown", handler, { once: false, passive: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    if (!ativo || silenciado) {
      if (intervaloRef.current) {
        window.clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      return;
    }

    const intenso = (segundosRestantes ?? 999) <= 15;
    const intervaloMs = intenso ? INTERVALO_INTENSO_MS : INTERVALO_NORMAL_MS;

    // Toca imediatamente ao começar / mudar de cadência
    destravarAudio().then(() => {
      tocarPadraoAlerta(intenso);
      vibrarPadrao(intenso);
    });

    if (intervaloRef.current) {
      window.clearInterval(intervaloRef.current);
    }
    intervaloRef.current = window.setInterval(() => {
      tocarPadraoAlerta(intenso);
      vibrarPadrao(intenso);
    }, intervaloMs);

    return () => {
      if (intervaloRef.current) {
        window.clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [ativo, silenciado, segundosRestantes]);

  return { silenciado, alternarSilenciado };
}
