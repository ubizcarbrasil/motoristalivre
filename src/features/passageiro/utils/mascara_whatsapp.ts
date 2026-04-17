/**
 * Aplica máscara de WhatsApp brasileiro: (11) 99999-9999
 */
export function aplicarMascaraWhatsapp(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10)
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function whatsappValido(valor: string): boolean {
  const d = valor.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 11;
}

export function apenasDigitosWhatsapp(valor: string): string {
  return valor.replace(/\D/g, "");
}
