import { z } from "zod";

export const schemaVeiculo = z.object({
  vehicle_model: z
    .string()
    .trim()
    .min(2, "Informe o modelo (mín. 2 caracteres)")
    .max(60, "Modelo muito longo"),
  vehicle_plate: z
    .string()
    .trim()
    .min(6, "Placa inválida")
    .max(10, "Placa inválida")
    .transform((v) => v.toUpperCase()),
  vehicle_color: z
    .string()
    .trim()
    .min(3, "Informe a cor")
    .max(30, "Cor muito longa"),
  vehicle_year: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || (/^\d{4}$/.test(v) && Number(v) >= 1980 && Number(v) <= new Date().getFullYear() + 1),
      "Ano inválido",
    ),
});

export type DadosVeiculo = z.infer<typeof schemaVeiculo>;
