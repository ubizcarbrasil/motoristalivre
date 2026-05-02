import type { UrgenciaOrcamento } from "../types/tipos_orcamento";

export const OPCOES_URGENCIA: { valor: UrgenciaOrcamento; rotulo: string }[] = [
  { valor: "agora", rotulo: "Agora" },
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "esta_semana", rotulo: "Esta semana" },
  { valor: "data_marcada", rotulo: "Escolher data" },
];

export const OPCOES_MAX_PROPOSTAS = [
  { valor: 1, rotulo: "Até 1 profissional" },
  { valor: 2, rotulo: "Até 2 profissionais" },
  { valor: 4, rotulo: "Até 4 profissionais" },
];

export const PASSOS_WIZARD = [
  "categoria",
  "servico",
  "perguntas",
  "local",
  "contato",
  "resumo",
] as const;

export type PassoWizard = (typeof PASSOS_WIZARD)[number];
