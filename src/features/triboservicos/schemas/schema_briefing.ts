import { z } from "zod";

/**
 * Schemas Zod por slug de categoria de serviço.
 *
 * Cada categoria define um conjunto de campos opcionais que o cliente
 * pode preencher para dar contexto ao profissional. Os dados são
 * persistidos em `service_bookings.briefing` (jsonb).
 *
 * Para adicionar uma nova categoria, basta:
 *  1. Adicionar uma entrada em `SCHEMAS_BRIEFING` com o slug;
 *  2. Definir os campos em `CAMPOS_BRIEFING` para renderização dinâmica.
 *
 * Slugs reconhecidos hoje em `service_categories`:
 *  estetica, beleza, saude, tecnico, automotivo, pet, outros
 */

const baseTexto = (max = 500) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres`).optional();

export const schemaBriefingEstetica = z.object({
  area_corporal: baseTexto(120),
  pele_sensivel: z.boolean().optional(),
  alergias: baseTexto(200),
  ja_realizou_antes: z.boolean().optional(),
  observacao_extra: baseTexto(300),
});

export const schemaBriefingBeleza = z.object({
  tipo_cabelo: baseTexto(60),
  comprimento: baseTexto(60),
  quimica_recente: z.boolean().optional(),
  referencia_visual: baseTexto(300),
  observacao_extra: baseTexto(300),
});

export const schemaBriefingSaude = z.object({
  motivo_consulta: baseTexto(300),
  doencas_preexistentes: baseTexto(200),
  medicamentos_em_uso: baseTexto(200),
  alergias: baseTexto(200),
  primeira_consulta: z.boolean().optional(),
});

export const schemaBriefingTecnico = z.object({
  equipamento: baseTexto(120),
  problema_relatado: baseTexto(500),
  marca_modelo: baseTexto(120),
  garantia_ativa: z.boolean().optional(),
});

export const schemaBriefingAutomotivo = z.object({
  veiculo: baseTexto(120),
  ano: baseTexto(10),
  placa: baseTexto(10),
  problema_relatado: baseTexto(500),
});

export const schemaBriefingPet = z.object({
  nome_pet: baseTexto(60),
  especie: baseTexto(40),
  raca: baseTexto(60),
  porte: z.enum(["pequeno", "medio", "grande"]).optional(),
  comportamento: baseTexto(200),
});

export const schemaBriefingOutros = z.object({
  descricao_necessidade: baseTexto(500),
});

export const SCHEMAS_BRIEFING = {
  estetica: schemaBriefingEstetica,
  beleza: schemaBriefingBeleza,
  saude: schemaBriefingSaude,
  tecnico: schemaBriefingTecnico,
  automotivo: schemaBriefingAutomotivo,
  pet: schemaBriefingPet,
  outros: schemaBriefingOutros,
} as const;

export type SlugCategoriaBriefing = keyof typeof SCHEMAS_BRIEFING;

export type DadosBriefing = z.infer<
  (typeof SCHEMAS_BRIEFING)[SlugCategoriaBriefing]
>;

export type TipoCampoBriefing = "texto" | "textarea" | "boolean" | "select";

export interface DefinicaoCampoBriefing {
  nome: string;
  rotulo: string;
  tipo: TipoCampoBriefing;
  placeholder?: string;
  opcoes?: { valor: string; rotulo: string }[];
  maxLength?: number;
}

export const CAMPOS_BRIEFING: Record<SlugCategoriaBriefing, DefinicaoCampoBriefing[]> = {
  estetica: [
    { nome: "area_corporal", rotulo: "Área a ser tratada", tipo: "texto", placeholder: "Ex: rosto, pernas…", maxLength: 120 },
    { nome: "pele_sensivel", rotulo: "Pele sensível?", tipo: "boolean" },
    { nome: "alergias", rotulo: "Alergias conhecidas", tipo: "textarea", placeholder: "Ex: produtos com ácido…", maxLength: 200 },
    { nome: "ja_realizou_antes", rotulo: "Já realizou esse procedimento antes?", tipo: "boolean" },
    { nome: "observacao_extra", rotulo: "Observação adicional", tipo: "textarea", maxLength: 300 },
  ],
  beleza: [
    { nome: "tipo_cabelo", rotulo: "Tipo de cabelo", tipo: "texto", placeholder: "Liso, ondulado, cacheado…", maxLength: 60 },
    { nome: "comprimento", rotulo: "Comprimento", tipo: "texto", placeholder: "Curto, médio, longo", maxLength: 60 },
    { nome: "quimica_recente", rotulo: "Possui química recente?", tipo: "boolean" },
    { nome: "referencia_visual", rotulo: "Tem alguma referência?", tipo: "textarea", placeholder: "Link de foto ou descrição", maxLength: 300 },
    { nome: "observacao_extra", rotulo: "Observação adicional", tipo: "textarea", maxLength: 300 },
  ],
  saude: [
    { nome: "motivo_consulta", rotulo: "Motivo da consulta", tipo: "textarea", maxLength: 300 },
    { nome: "doencas_preexistentes", rotulo: "Doenças preexistentes", tipo: "textarea", maxLength: 200 },
    { nome: "medicamentos_em_uso", rotulo: "Medicamentos em uso", tipo: "textarea", maxLength: 200 },
    { nome: "alergias", rotulo: "Alergias", tipo: "textarea", maxLength: 200 },
    { nome: "primeira_consulta", rotulo: "É sua primeira consulta?", tipo: "boolean" },
  ],
  tecnico: [
    { nome: "equipamento", rotulo: "Equipamento", tipo: "texto", placeholder: "Ex: notebook, ar-condicionado…", maxLength: 120 },
    { nome: "marca_modelo", rotulo: "Marca / modelo", tipo: "texto", maxLength: 120 },
    { nome: "problema_relatado", rotulo: "Descreva o problema", tipo: "textarea", maxLength: 500 },
    { nome: "garantia_ativa", rotulo: "Está em garantia?", tipo: "boolean" },
  ],
  automotivo: [
    { nome: "veiculo", rotulo: "Veículo", tipo: "texto", placeholder: "Modelo / marca", maxLength: 120 },
    { nome: "ano", rotulo: "Ano", tipo: "texto", maxLength: 10 },
    { nome: "placa", rotulo: "Placa", tipo: "texto", maxLength: 10 },
    { nome: "problema_relatado", rotulo: "Problema relatado", tipo: "textarea", maxLength: 500 },
  ],
  pet: [
    { nome: "nome_pet", rotulo: "Nome do pet", tipo: "texto", maxLength: 60 },
    { nome: "especie", rotulo: "Espécie", tipo: "texto", placeholder: "Cão, gato…", maxLength: 40 },
    { nome: "raca", rotulo: "Raça", tipo: "texto", maxLength: 60 },
    {
      nome: "porte",
      rotulo: "Porte",
      tipo: "select",
      opcoes: [
        { valor: "pequeno", rotulo: "Pequeno" },
        { valor: "medio", rotulo: "Médio" },
        { valor: "grande", rotulo: "Grande" },
      ],
    },
    { nome: "comportamento", rotulo: "Comportamento", tipo: "textarea", placeholder: "Calmo, ansioso, mordedor…", maxLength: 200 },
  ],
  outros: [
    { nome: "descricao_necessidade", rotulo: "Descreva o que precisa", tipo: "textarea", maxLength: 500 },
  ],
};

/**
 * Resolve um slug de categoria para um schema válido. Caso o slug seja
 * desconhecido, retorna o schema "outros" como fallback seguro.
 */
export function resolverSchemaBriefing(slug: string | null | undefined) {
  if (!slug) return null;
  const chave = slug as SlugCategoriaBriefing;
  return SCHEMAS_BRIEFING[chave] ?? null;
}

export function resolverCamposBriefing(slug: string | null | undefined) {
  if (!slug) return null;
  const chave = slug as SlugCategoriaBriefing;
  return CAMPOS_BRIEFING[chave] ?? null;
}
