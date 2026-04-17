/**
 * Utilitários para detectar contexto PWA (instalação, plataforma).
 * Evita falsos positivos quando o app roda dentro do preview do Lovable
 * (iframe + display-mode standalone do wrapper).
 */

export function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function ehAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function estaEmIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function ehHostDePreview(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host.includes("lovableproject.com") ||
    host.includes("id-preview--") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function referrerEhLovable(): boolean {
  if (typeof document === "undefined") return false;
  const ref = document.referrer || "";
  return ref.includes("lovable.app") || ref.includes("lovableproject.com");
}

/**
 * Retorna true SOMENTE quando o app está rodando como PWA instalado real,
 * fora de iframes e fora de hosts de preview/desenvolvimento.
 */
export function estaInstalado(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as unknown as { standalone: boolean }).standalone;

  const standalone = standaloneMatch || iosStandalone;
  if (!standalone) return false;

  if (estaEmIframe()) return false;
  if (ehHostDePreview()) return false;
  if (referrerEhLovable()) return false;

  return true;
}
