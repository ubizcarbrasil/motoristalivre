/**
 * Registro condicional do service worker do PWA.
 *
 * Regras:
 * - Nunca registra dentro de iframe (preview do Lovable usa iframe).
 * - Nunca registra em hosts de preview (`*.lovableproject.com`,
 *   `id-preview--*.lovable.app`).
 * - Em ambientes de preview, força a remoção de qualquer SW antigo
 *   que tenha sido registrado por engano.
 *
 * Em produção real (motoristalivre.lovable.app, motoristalivre.com.br),
 * o SW é registrado normalmente pelo `virtual:pwa-register`.
 */
export function registrarServiceWorker(): void {
  if (typeof window === "undefined") return;

  const dentroDeIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const ehPreview =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  if (dentroDeIframe || ehPreview) {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => undefined);
    }
    return;
  }

  // Import dinâmico — evita carregar o módulo virtual em dev/preview.
  void import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => undefined);
}
