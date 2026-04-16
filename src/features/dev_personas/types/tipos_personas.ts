export type RolePersona =
  | "root_admin"
  | "tenant_admin"
  | "manager"
  | "driver"
  | "affiliate"
  | "passenger";

export interface Persona {
  nivel: number;
  titulo: string;
  descricao: string;
  role: RolePersona;
  email: string;
  senha: string;
  rotaDestino: string;
}

export interface ResultadoSeed {
  ok: boolean;
  tenant?: { id: string; slug: string };
  personas?: Array<{ email: string; status: string; userId?: string }>;
  error?: string;
}
