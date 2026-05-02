import { z } from "zod";

const percentual = z
  .number({ invalid_type_error: "Informe um número" })
  .min(0, "Mínimo 0%")
  .max(100, "Máximo 100%");

export const schemaComissoes = z.object({
  transbordo_commission: percentual,
  affiliate_commission: percentual,
  cashback_pct: percentual,
}) satisfies z.ZodType<{
  transbordo_commission: number;
  affiliate_commission: number;
  cashback_pct: number;
}>;

export type ValoresComissoes = z.infer<typeof schemaComissoes>;
