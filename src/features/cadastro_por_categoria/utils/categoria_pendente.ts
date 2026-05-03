const CHAVE = "tribocar_pending_categoria";

export function salvarCategoriaPendente(idCategoria: string): void {
  try {
    localStorage.setItem(CHAVE, idCategoria);
  } catch {
    // ignora indisponibilidade do storage
  }
}

export function obterCategoriaPendente(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function limparCategoriaPendente(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // ignora
  }
}
