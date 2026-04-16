import { z } from "zod";
import { VALOR_MINIMO_SAQUE } from "../types/tipos_saque";

export const schemaSolicitarSaque = z
  .object({
    amount: z
      .number({ invalid_type_error: "Informe um valor válido" })
      .min(VALOR_MINIMO_SAQUE, { message: `Valor mínimo de R$ ${VALOR_MINIMO_SAQUE},00` }),
    pixKey: z
      .string()
      .trim()
      .min(1, { message: "Chave PIX é obrigatória" })
      .max(140, { message: "Chave PIX muito longa" }),
    pixKeyType: z.enum(["cpf", "email", "telefone", "aleatoria"]),
    saldoDisponivel: z.number().nonnegative(),
  })
  .refine((d) => d.amount <= d.saldoDisponivel, {
    message: "Valor maior que o saldo disponível",
    path: ["amount"],
  });

export type FormularioSaque = z.infer<typeof schemaSolicitarSaque>;
