// Resolve o modo visual do painel com base no tipo de profissional
// e nos módulos ativos da tribo. A regra principal: se o usuário é
// somente prestador de serviços, a UI deve esconder qualquer bloco
// de mobilidade urbana, mesmo quando a tribo tem `mobility` ativo.

import type { TipoProfissional } from "@/features/servicos/types/tipos_servicos";

export type ModoPainel = "mobilidade" | "servicos" | "hibrido";

export function resolverModoPainel(
  professionalType: TipoProfissional | undefined,
  activeModules: string[] | undefined,
): ModoPainel {
  const temMobilidade = !!activeModules?.includes("mobility");
  const temServicos = !!activeModules?.includes("services");

  if (professionalType === "service_provider") return "servicos";
  if (professionalType === "both" && temServicos) return "hibrido";

  // driver puro
  if (temMobilidade && !temServicos) return "mobilidade";
  if (!temMobilidade && temServicos) return "servicos";
  if (temMobilidade && temServicos) return "hibrido";
  return "mobilidade";
}

export function ehModoServicos(modo: ModoPainel): boolean {
  return modo === "servicos";
}

export function mostraMobilidade(modo: ModoPainel): boolean {
  return modo === "mobilidade" || modo === "hibrido";
}

export function mostraServicos(modo: ModoPainel): boolean {
  return modo === "servicos" || modo === "hibrido";
}
