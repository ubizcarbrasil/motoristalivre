import { z } from "zod";

const percentual = z
  .number({ invalid_type_error: "Informe um número" })
  .min(0, "Mínimo 0%")
  .max(100, "Máximo 100%");

const reais = z
  .number({ invalid_type_error: "Informe um valor" })
  .min(0, "Mínimo R$ 0")
  .max(100000, "Máximo R$ 100.000");

export const schemaRegraComissao = z.object({
  category_id: z.string().uuid("Categoria inválida"),
  comissao_cobertura_pct: percentual,
  comissao_indicacao_pct: percentual,
  comissao_fixa_brl: reais,
  ativo: z.boolean(),
});

export type ValoresRegraComissao = z.infer<typeof schemaRegraComissao>;
