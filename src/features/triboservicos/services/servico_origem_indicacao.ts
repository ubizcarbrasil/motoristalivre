/**
 * Marca o profissional de origem da indicação na sessão do navegador.
 * Quando alguém abre /s/:slug/a/:driver_slug, gravamos o id do profissional
 * que indicou. Os agendamentos feitos a seguir gravam esse id em
 * service_bookings.origin_driver_id, permitindo cálculo de comissão de afiliado.
 */
const CHAVE = "tribo:origem_indicacao";

interface OrigemIndicacao {
  origin_driver_id: string;
  origin_driver_slug: string;
  tenant_slug: string;
  expires_at: number;
}

const VALIDADE_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

export function gravarOrigemIndicacao(params: {
  origin_driver_id: string;
  origin_driver_slug: string;
  tenant_slug: string;
}): void {
  if (typeof window === "undefined") return;
  const payload: OrigemIndicacao = {
    ...params,
    expires_at: Date.now() + VALIDADE_MS,
  };
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify(payload));
    window.localStorage.setItem(CHAVE, JSON.stringify(payload));
  } catch {
    // ignora erro de storage indisponível
  }
}

export function lerOrigemIndicacao(tenantSlug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto =
      window.sessionStorage.getItem(CHAVE) ?? window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const payload = JSON.parse(bruto) as OrigemIndicacao;
    if (payload.tenant_slug !== tenantSlug) return null;
    if (payload.expires_at < Date.now()) {
      limparOrigemIndicacao();
      return null;
    }
    return payload.origin_driver_id;
  } catch {
    return null;
  }
}

export function limparOrigemIndicacao(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CHAVE);
    window.localStorage.removeItem(CHAVE);
  } catch {
    // ignora
  }
}
