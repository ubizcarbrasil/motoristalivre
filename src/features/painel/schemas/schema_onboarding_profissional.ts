import { z } from "zod";
import { slugValido } from "@/compartilhados/constants/constantes_categorias_servico";

export const schemaOnboardingProfissional = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo")
    .max(100, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido (com DDD)")
    .max(20, "Telefone muito longo"),
  cidade: z
    .string()
    .trim()
    .min(2, "Informe a cidade")
    .max(80, "Cidade muito longa"),
  professional_type: z.enum(["driver", "service_provider", "both"], {
    errorMap: () => ({ message: "Selecione o tipo de profissional" }),
  }),
  bio: z
    .string()
    .trim()
    .min(20, "Descreva seu trabalho com pelo menos 20 caracteres")
    .max(500, "Máximo de 500 caracteres"),
  service_categories: z
    .array(z.string().trim().min(1).max(80))
    .min(1, "Selecione ao menos 1 categoria")
    .max(10, "Máximo de 10 categorias")
    .refine(
      (lista) => lista.every((s) => slugValido(s)),
      { message: "Algumas categorias antigas não são mais suportadas. Toque em Editar e refaça a seleção." },
    ),
  avatar_url: z.string().url("Faça upload da foto de perfil"),
  cover_url: z.string().url("Faça upload da foto de capa"),
});

export type DadosOnboarding = z.infer<typeof schemaOnboardingProfissional>;
