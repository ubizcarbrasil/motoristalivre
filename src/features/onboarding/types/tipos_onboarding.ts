export interface DadosIdentidade {
  nome: string;
  cidade: string;
  descricao: string;
  subdominio: string;
  whatsapp: string;
  logoUrl: string;
  capaUrl: string;
}

export interface PlanoOpcao {
  id: string;
  nome: string;
  precoMensal: number;
  precoAdesao: number;
  maxMotoristas: number;
  features: string[];
  destaque?: boolean;
}

export interface DadosConfiguracao {
  modoDespacho: "auto" | "manual" | "hybrid";
  bandeira: number;
  precoPorKm: number;
  precoPorMin: number;
  comissaoTransbordo: number;
  cashbackPadrao: number;
}

export interface DadosOnboarding {
  identidade: DadosIdentidade;
  planoSelecionado: string;
  pagamentoConfirmado: boolean;
  configuracao: DadosConfiguracao;
}

export type EtapaOnboarding = 0 | 1 | 2 | 3 | 4;
