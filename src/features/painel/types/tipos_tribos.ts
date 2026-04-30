export type PapelNaTribo = "dono" | "membro";

export interface TriboMotorista {
  id: string;
  nome: string;
  slug: string;
  papel: PapelNaTribo;
  ehPrincipal: boolean; // tribo onde recebe corridas (drivers.tenant_id)
  modulosAtivos?: string[]; // tenants.active_modules (mobility/services)
}
