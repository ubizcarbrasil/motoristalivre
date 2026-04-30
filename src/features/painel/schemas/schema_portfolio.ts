import { z } from "zod";

// Constantes de validação reutilizáveis
export const PORTFOLIO_TAMANHO_MAX_MB = 5;
export const PORTFOLIO_TAMANHO_MAX_BYTES = PORTFOLIO_TAMANHO_MAX_MB * 1024 * 1024;
export const PORTFOLIO_DIMENSAO_MIN = 400;
export const PORTFOLIO_DIMENSAO_MAX = 4096;
export const PORTFOLIO_FORMATOS_ACEITOS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;
export const PORTFOLIO_CAPTION_MAX = 120;

// Schema do formulário (campos textuais)
export const schemaItemPortfolio = z.object({
  service_type_id: z
    .string({ required_error: "Escolha o serviço relacionado" })
    .uuid({ message: "Serviço inválido" }),
  caption: z
    .string()
    .trim()
    .max(PORTFOLIO_CAPTION_MAX, {
      message: `Legenda deve ter no máximo ${PORTFOLIO_CAPTION_MAX} caracteres`,
    })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type FormularioItemPortfolio = z.infer<typeof schemaItemPortfolio>;

// Validação do arquivo (separada por ser assíncrona)
export interface ResultadoValidacaoArquivo {
  ok: boolean;
  mensagem?: string;
  largura?: number;
  altura?: number;
}

export async function validarArquivoPortfolio(
  arquivo: File,
): Promise<ResultadoValidacaoArquivo> {
  if (!arquivo.type.startsWith("image/")) {
    return { ok: false, mensagem: "O arquivo selecionado não é uma imagem" };
  }
  if (!PORTFOLIO_FORMATOS_ACEITOS.includes(arquivo.type as any)) {
    return {
      ok: false,
      mensagem: "Use JPG, PNG ou WebP",
    };
  }
  if (arquivo.size > PORTFOLIO_TAMANHO_MAX_BYTES) {
    return {
      ok: false,
      mensagem: `Imagem deve ter no máximo ${PORTFOLIO_TAMANHO_MAX_MB}MB`,
    };
  }

  // Verifica dimensões
  const dimensoes = await new Promise<{ w: number; h: number } | null>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(arquivo);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });

  if (!dimensoes) {
    return { ok: false, mensagem: "Não foi possível ler a imagem" };
  }
  if (dimensoes.w < PORTFOLIO_DIMENSAO_MIN || dimensoes.h < PORTFOLIO_DIMENSAO_MIN) {
    return {
      ok: false,
      mensagem: `Imagem muito pequena. Mínimo ${PORTFOLIO_DIMENSAO_MIN}x${PORTFOLIO_DIMENSAO_MIN}px`,
    };
  }
  if (dimensoes.w > PORTFOLIO_DIMENSAO_MAX || dimensoes.h > PORTFOLIO_DIMENSAO_MAX) {
    return {
      ok: false,
      mensagem: `Imagem muito grande. Máximo ${PORTFOLIO_DIMENSAO_MAX}px por lado`,
    };
  }

  return { ok: true, largura: dimensoes.w, altura: dimensoes.h };
}
