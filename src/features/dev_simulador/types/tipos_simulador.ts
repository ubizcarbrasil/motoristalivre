export interface TenantOpcao {
  id: string;
  name: string;
  slug: string;
}

export interface MotoristaOpcao {
  id: string;
  nome: string;
  is_online: boolean;
  slug: string;
}

export interface DadosSimulacao {
  tenantId: string;
  motoristaId: string;
  origem: string;
  destino: string;
  valor: number;
  distanciaKm: number;
  duracaoMin: number;
}

export type NivelLog = "info" | "sucesso" | "erro";

export interface EntradaLog {
  id: string;
  momento: string;
  nivel: NivelLog;
  mensagem: string;
}
