export type SecaoAdmin =
  | "dashboard"
  | "motoristas"
  | "afiliados"
  | "crm"
  | "corridas"
  | "carteira"
  | "identidade"
  | "regras"
  | "comissoes"
  | "regras_comissao";

export interface StatsAdmin {
  receitaHoje: number;
  corridasHoje: number;
  comissoesHoje: number;
  afiliadosAtivos: number;
  motoristasOnline: number;
}

export interface MotoristaResumo {
  id: string;
  nome: string;
  slug: string;
  corridasTotal: number;
  corridasHoje: number;
  faturamentoHoje: number;
  online: boolean;
  status: "active" | "inactive" | "banned";
  avatarUrl: string | null;
}

export interface AfiliadoResumo {
  id: string;
  nome: string;
  nomeEstabelecimento: string | null;
  tipo: string | null;
  corridasGeradas: number;
  corridasHoje: number;
  ganhos: number;
  aprovado: boolean;
  slug: string;
}

export interface ClienteCRM {
  id: string;
  nome: string | null;
  telefone: string | null;
  totalCorridas: number;
  totalGasto: number;
  saldoCashback: number;
  origem: string | null;
  ultimoAcesso: string | null;
  frequencia: "vip" | "regular" | "risco" | "perdido";
}

export interface CorridaHistorico {
  id: string;
  passageiroNome: string | null;
  motoristaNome: string | null;
  origemEndereco: string | null;
  destinoEndereco: string | null;
  valor: number | null;
  status: string;
  criadaEm: string;
  transbordo: boolean;
  origemLink: string | null;
}
