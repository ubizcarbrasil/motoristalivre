import type {
  DisponibilidadeProfissional,
  AgendamentoServico,
} from "@/features/servicos/types/tipos_servicos";

export interface SlotDisponivel {
  hora: string; // HH:MM
  iso: string;
  inicioMs: number;
}

/**
 * Gera slots disponíveis para uma data específica considerando:
 * - blocos de disponibilidade do dia da semana
 * - duração do serviço a ser agendado
 * - agendamentos já existentes (conflitos)
 * - horário atual (remove slots passados se for hoje)
 */
export function gerarSlotsDoDia(params: {
  data: Date;
  blocos: DisponibilidadeProfissional[];
  agendamentos: Pick<AgendamentoServico, "scheduled_at" | "duration_minutes">[];
  duracaoServicoMin: number;
}): SlotDisponivel[] {
  const { data, blocos, agendamentos, duracaoServicoMin } = params;
  const dow = data.getDay();
  const blocosDoDia = blocos.filter((b) => b.day_of_week === dow && b.is_active);
  if (blocosDoDia.length === 0) return [];

  const agora = new Date();
  const ehHoje =
    data.getFullYear() === agora.getFullYear() &&
    data.getMonth() === agora.getMonth() &&
    data.getDate() === agora.getDate();

  const slots: SlotDisponivel[] = [];
  for (const bloco of blocosDoDia) {
    const [sh, sm] = bloco.start_time.split(":").map(Number);
    const [eh, em] = bloco.end_time.split(":").map(Number);
    const passo = bloco.slot_duration_minutes + (bloco.buffer_minutes ?? 0);

    let cursor = new Date(data);
    cursor.setHours(sh, sm, 0, 0);
    const fimBloco = new Date(data);
    fimBloco.setHours(eh, em, 0, 0);

    while (cursor.getTime() + duracaoServicoMin * 60_000 <= fimBloco.getTime()) {
      const inicioMs = cursor.getTime();
      // descarta passados
      if (ehHoje && inicioMs <= agora.getTime()) {
        cursor = new Date(cursor.getTime() + passo * 60_000);
        continue;
      }
      const fimMs = inicioMs + duracaoServicoMin * 60_000;
      const conflita = agendamentos.some((a) => {
        const aIni = new Date(a.scheduled_at).getTime();
        const aFim = aIni + a.duration_minutes * 60_000;
        return aIni < fimMs && aFim > inicioMs;
      });
      if (!conflita) {
        const hh = String(cursor.getHours()).padStart(2, "0");
        const mm = String(cursor.getMinutes()).padStart(2, "0");
        slots.push({ hora: `${hh}:${mm}`, iso: cursor.toISOString(), inicioMs });
      }
      cursor = new Date(cursor.getTime() + passo * 60_000);
    }
  }

  return slots.sort((a, b) => a.inicioMs - b.inicioMs);
}

export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
