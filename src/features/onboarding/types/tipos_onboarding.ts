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

export type ModoCobranca = "fixed" | "hourly" | "daily";

export interface DadosServico {
  id: string;
  nome: string;
  descricao: string;
  modoCobranca: ModoCobranca;
  preco: number;
  duracao: number; // unidade conforme modoCobranca: minutos / horas / dias
  depositoAtivo: boolean;
  depositoTipo: "percent" | "value";
  depositoPct: number;
  depositoValor: number;
}

export type ModuloPlataforma = "mobility" | "services";

export interface DadosDisponibilidadeOnboarding {
  dias: import("@/features/servicos/types/tipos_servicos").DiaDisponibilidadeOnboarding[];
  slotMin: number;
  bufferMin: number;
}

export interface DadosOnboarding {
  identidade: DadosIdentidade;
  modulos: ModuloPlataforma[];
  planoSelecionado: string;
  pagamentoConfirmado: boolean;
  configuracao: DadosConfiguracao;
  servicos: DadosServico[];
  disponibilidade: DadosDisponibilidadeOnboarding;
}

export type EtapaOnboarding = 0 | 1 | 2 | 3 | 4 | 5;
