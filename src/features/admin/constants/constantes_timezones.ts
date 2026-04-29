// Lista de fusos horários brasileiros e principais internacionais
export interface OpcaoTimezone {
  valor: string;
  rotulo: string;
}

export const TIMEZONES_DISPONIVEIS: OpcaoTimezone[] = [
  { valor: "America/Sao_Paulo", rotulo: "Brasília (GMT-3) — SP, RJ, MG, PR, SC, RS, GO, DF, BA, ES" },
  { valor: "America/Manaus", rotulo: "Amazonas (GMT-4) — AM, MT, MS, RO, RR" },
  { valor: "America/Cuiaba", rotulo: "Cuiabá (GMT-4) — MT" },
  { valor: "America/Campo_Grande", rotulo: "Campo Grande (GMT-4) — MS" },
  { valor: "America/Porto_Velho", rotulo: "Porto Velho (GMT-4) — RO" },
  { valor: "America/Boa_Vista", rotulo: "Boa Vista (GMT-4) — RR" },
  { valor: "America/Rio_Branco", rotulo: "Acre (GMT-5) — AC" },
  { valor: "America/Belem", rotulo: "Belém (GMT-3) — PA, AP, MA, TO" },
  { valor: "America/Fortaleza", rotulo: "Fortaleza (GMT-3) — CE, PI, RN, PB, PE, AL, SE" },
  { valor: "America/Recife", rotulo: "Recife (GMT-3) — PE" },
  { valor: "America/Bahia", rotulo: "Salvador (GMT-3) — BA" },
  { valor: "America/Maceio", rotulo: "Maceió (GMT-3) — AL" },
  { valor: "America/Noronha", rotulo: "Fernando de Noronha (GMT-2)" },
];
