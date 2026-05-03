export type PapelNaTribo = "dono" | "membro";

export interface TriboMotorista {
  id: string;
  nome: string;
  slug: string;
  papel: PapelNaTribo;
  ehPrincipal: boolean; // tribo onde recebe corridas (drivers.tenant_id)
  activeModules: string[]; // ["mobility"], ["services"] ou ambos
  signupSlug: string | null; // link de recrutamento (se categoria já configurada)
  categoriaNome: string | null; // nome da categoria principal da tribo
}
