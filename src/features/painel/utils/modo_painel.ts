// Resolve o modo visual do painel.
// Regra principal: se o usuário (dono ou membro) é service_provider, a UI
// trata tudo como serviços, mesmo que a tribo ainda tenha módulo `mobility`
// ativo (caso comum em tribos legadas que vieram com mobility por padrão).

import type { TipoProfissional } from "@/features/servicos/types/tipos_servicos";

export type ModoPainel = "mobilidade" | "servicos" | "hibrido";

export function resolverModoPainel(
  professionalType: TipoProfissional | undefined | null,
  activeModules: string[] | undefined | null,
): ModoPainel {
  const temMobilidade = !!activeModules?.includes("mobility");
  const temServicos = !!activeModules?.includes("services");

  // Tipo do profissional manda quando há um.
  if (professionalType === "service_provider") return "servicos";
  if (professionalType === "both") {
    if (temServicos && temMobilidade) return "hibrido";
    if (temServicos) return "servicos";
    return "mobilidade";
  }
  if (professionalType === "driver") {
    if (temMobilidade && temServicos) return "hibrido";
    return "mobilidade";
  }

  // Sem tipo definido: cai nos módulos da tribo.
  if (temServicos && !temMobilidade) return "servicos";
  if (temMobilidade && !temServicos) return "mobilidade";
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
