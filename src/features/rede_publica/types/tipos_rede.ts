import type { MembroEquipe } from "@/features/motorista/types/tipos_vitrine";
import type { StatusDisponibilidade } from "@/features/triboservicos/services/servico_status_equipe";

export interface MembroRedePublica extends MembroEquipe {
  status: StatusDisponibilidade;
}

export type FiltroStatusRede = "todos" | StatusDisponibilidade;

export interface FiltrosRede {
  busca: string;
  categoria: string | null;
  status: FiltroStatusRede;
}

export interface DonoRede {
  driverId: string;
  driverSlug: string;
  nome: string;
  avatarUrl: string | null;
}
