import { z } from "zod";

export const schemaContato = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp inválido")
    .max(20)
    .refine((v) => v.replace(/\D/g, "").length >= 10, "WhatsApp inválido"),
});

export const schemaEndereco = z.object({
  cep: z.string().refine((v) => v.replace(/\D/g, "").length === 8, "CEP inválido"),
  logradouro: z.string().trim().min(2, "Informe o logradouro").max(200),
  numero: z.string().trim().min(1, "Informe o número").max(20),
  complemento: z.string().trim().max(100).optional().or(z.literal("")),
  bairro: z.string().trim().min(2, "Informe o bairro").max(120),
  cidade: z.string().trim().min(2, "Informe a cidade").max(120),
  uf: z.string().trim().length(2, "UF inválida"),
  referencia: z.string().trim().max(200).optional().or(z.literal("")),
});
