export type SecaoRoot =
  | "visao_geral"
  | "tenants"
  | "planos"
  | "afiliados"
  | "financeiro"
  | "operacao"
  | "auditoria";

export interface StatsPlataforma {
  totalTenants: number;
  totalMotoristas: number;
  totalAfiliados: number;
  mrr: number;
  corridasMes: number;
  receitaMes: number;
}

export interface TenantResumo {
  id: string;
  nome: string;
  slug: string;
  plano: string | null;
  status: string;
  motoristas: number;
  afiliados: number;
  mrr: number;
}

export interface PlanoEditavel {
  id: string;
  nome: string;
  precoMensal: number;
  precoSignup: number;
  maxMotoristas: number;
  features: string[];
}

export interface AfiliadoGlobal {
  id: string;
  slug: string;
  nomeEstabelecimento: string | null;
  tenantNome: string;
  corridasGeradas: number;
  comissoes: number;
  aprovado: boolean;
}

export interface SaquePendente {
  id: string;
  donoNome: string | null;
  donoTipo: "driver" | "affiliate" | "group";
  tenantNome: string;
  valor: number;
  pixKey: string | null;
  pixKeyType: string | null;
  solicitadoEm: string;
}

export interface LogAuditoria {
  id: string;
  acao: string;
  tipoEntidade: string | null;
  usuarioNome: string | null;
  timestamp: string;
  payload: Record<string, unknown> | null;
}
