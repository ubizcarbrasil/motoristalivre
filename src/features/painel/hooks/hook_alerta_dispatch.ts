import { useEffect, useRef, useState, useCallback } from "react";
import { destravarAudio, tocarPadraoAlerta, vibrarPadrao, type TipoSomChamada } from "../utils/audio_alerta";

const CHAVE_MUTE = "tribocar_dispatch_mute";
const CHAVE_SOM = "tribocar_dispatch_som";
const INTERVALO_NORMAL_MS = 2200;
const INTERVALO_INTENSO_MS = 1100;

const SONS_VALIDOS: TipoSomChamada[] = ["suave", "padrao", "sirene"];

function lerSomSalvo(): TipoSomChamada {
  if (typeof window === "undefined") return "padrao";
  const valor = localStorage.getItem(CHAVE_SOM);
  return SONS_VALIDOS.includes(valor as TipoSomChamada) ? (valor as TipoSomChamada) : "padrao";
}

interface Props {
  ativo: boolean;
  segundosRestantes?: number;
}

/**
 * Toca beep + vibra enquanto houver dispatch pendente.
 * Para automaticamente quando `ativo` vira false.
 * Respeita preferência salva no localStorage (mute + tipo de som).
 */
export function useAlertaDispatch({ ativo, segundosRestantes }: Props) {
  const [silenciado, setSilenciadoState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CHAVE_MUTE) === "1";
  });
  const [tipoSom, setTipoSomState] = useState<TipoSomChamada>(lerSomSalvo);
  const intervaloRef = useRef<number | null>(null);
  const tipoSomRef = useRef<TipoSomChamada>(tipoSom);
  tipoSomRef.current = tipoSom;

  const setSilenciado = useCallback((valor: boolean) => {
    setSilenciadoState(valor);
    if (typeof window !== "undefined") {
      localStorage.setItem(CHAVE_MUTE, valor ? "1" : "0");
    }
  }, []);

  const alternarSilenciado = useCallback(() => {
    setSilenciado(!silenciado);
  }, [silenciado, setSilenciado]);

  const setTipoSom = useCallback((valor: TipoSomChamada) => {
    setTipoSomState(valor);
    if (typeof window !== "undefined") {
      localStorage.setItem(CHAVE_SOM, valor);
    }
  }, []);

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

  // Sincroniza preferência caso outra aba/tela altere
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CHAVE_SOM) {
        setTipoSomState(lerSomSalvo());
      }
      if (e.key === CHAVE_MUTE) {
        setSilenciadoState(e.newValue === "1");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
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
      tocarPadraoAlerta(intenso, tipoSomRef.current);
      vibrarPadrao(intenso);
    });

    if (intervaloRef.current) {
      window.clearInterval(intervaloRef.current);
    }
    intervaloRef.current = window.setInterval(() => {
      tocarPadraoAlerta(intenso, tipoSomRef.current);
      vibrarPadrao(intenso);
    }, intervaloMs);

    return () => {
      if (intervaloRef.current) {
        window.clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [ativo, silenciado, segundosRestantes]);

  return { silenciado, alternarSilenciado, tipoSom, setTipoSom };
}
