export type TipoProfissional = "driver" | "service_provider" | "both";

export type StatusAgendamento =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type FormaPagamentoServico = "cash" | "pix" | "card" | "balance";

export interface TipoServico {
  id: string;
  driver_id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_immediate: boolean;
  is_active: boolean;
  created_at: string;
  category_id?: string | null;
}

export interface DisponibilidadeProfissional {
  id: string;
  driver_id: string;
  tenant_id: string;
  day_of_week: number; // 0 = domingo
  start_time: string; // "HH:MM:SS"
  end_time: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  is_active: boolean;
}

export interface BloqueioAgenda {
  id: string;
  driver_id: string;
  tenant_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  all_day: boolean;
  created_at: string;
}

export interface FaixaHorarioOnboarding {
  inicio: string; // "HH:MM"
  fim: string;
}

export interface DiaDisponibilidadeOnboarding {
  dia_semana: number; // 0 = dom
  ativo: boolean;
  faixas: FaixaHorarioOnboarding[];
}

export interface AgendamentoServico {
  id: string;
  tenant_id: string;
  driver_id: string;
  client_id: string | null;
  guest_passenger_id: string | null;
  service_type_id: string;
  scheduled_at: string;
  duration_minutes: number;
  price_agreed: number;
  payment_method: FormaPagamentoServico;
  status: StatusAgendamento;
  notes: string | null;
  created_at: string;
}

export interface AgendamentoComCliente extends AgendamentoServico {
  cliente_nome: string;
  servico_nome: string;
}

export interface CredencialProfissional {
  id: string;
  credential_type: "crm" | "oab" | "crea" | "cro" | "crn" | "cref" | "other";
  credential_number: string;
  issuing_body: string | null;
  uf: string | null;
  status: "pending" | "verified" | "rejected" | "expired";
}
