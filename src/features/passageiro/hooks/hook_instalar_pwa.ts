import { useEffect, useState, useCallback } from "react";
import { estaInstalado, ehIOS, ehAndroid } from "@/compartilhados/utils/detectar_pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstalarPwa() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    setInstalado(estaInstalado());

    const handler = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstalacao = useCallback(async () => {
    if (!evento) return false;
    await evento.prompt();
    const escolha = await evento.userChoice;
    setEvento(null);
    if (escolha.outcome === "accepted") {
      setInstalado(true);
      return true;
    }
    return false;
  }, [evento]);

  const podeInstalarNativo = !!evento && !instalado;
  const precisaInstrucoesIos = ehIOS() && !instalado && !evento;
  const podeMostrarBotao = !instalado && (podeInstalarNativo || ehIOS() || ehAndroid());

  return {
    instalado,
    podeInstalarNativo,
    precisaInstrucoesIos,
    podeMostrarBotao,
    promptInstalacao,
  };
}
