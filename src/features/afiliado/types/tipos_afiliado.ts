export interface AfiliadoPerfil {
  id: string;
  slug: string;
  nomeEstabelecimento: string | null;
  tipo: string | null;
  aprovado: boolean;
  tenantNome: string;
  tenantSlug: string;
}

export interface StatsAfiliado {
  corridasGeradas: number;
  ganhosTotal: number;
  saldoAtual: number;
}

export interface CorridaAfiliado {
  id: string;
  origemEndereco: string | null;
  destinoEndereco: string | null;
  motoristaNome: string | null;
  data: string;
  comissao: number;
}
