import type { AbaPainel } from "../types/tipos_painel";

/**
 * Define quais módulos cada aba do painel exige.
 * `null` = aba sempre disponível (independe de módulo).
 */
const ABAS_MODULOS: Record<AbaPainel, ("mobility" | "services")[] | null> = {
  inicio: null,
  tribo: null,
  meus_links: ["mobility"], // links de captação são de mobilidade
  carteira: null,
  perfil: null,
  configuracoes: null,
};

export function abaPermitida(
  aba: AbaPainel,
  activeModules: string[] | undefined,
): boolean {
  const exigidos = ABAS_MODULOS[aba];
  if (exigidos === null) return true;
  if (!activeModules || activeModules.length === 0) return false;
  return exigidos.some((m) => activeModules.includes(m));
}

export function resolverAbaInicialPermitida(
  aba: AbaPainel,
  activeModules: string[] | undefined,
): AbaPainel {
  return abaPermitida(aba, activeModules) ? aba : "inicio";
}
