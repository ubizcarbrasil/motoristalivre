import { useEffect, useState } from "react";
import { Plus, Trash2, Copy, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { salvarDisponibilidadeEmMassa } from "@/features/servicos/services/servico_servicos";
import type {
  DisponibilidadeProfissional,
  DiaDisponibilidadeOnboarding,
} from "@/features/servicos/types/tipos_servicos";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface PresetDef {
  id: string;
  rotulo: string;
  dias: DiaDisponibilidadeOnboarding[];
}

const PRESETS: PresetDef[] = [
  {
    id: "comercial",
    rotulo: "Comercial seg–sex 9h–18h",
    dias: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      dia_semana: d,
      ativo: d >= 1 && d <= 5,
      faixas: d >= 1 && d <= 5 ? [{ inicio: "09:00", fim: "18:00" }] : [],
    })),
  },
  {
    id: "estendido",
    rotulo: "Seg–sáb 8h–20h",
    dias: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      dia_semana: d,
      ativo: d >= 1 && d <= 6,
      faixas: d >= 1 && d <= 6 ? [{ inicio: "08:00", fim: "20:00" }] : [],
    })),
  },
  {
    id: "fds",
    rotulo: "Final de semana 9h–17h",
    dias: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      dia_semana: d,
      ativo: d === 0 || d === 6,
      faixas: d === 0 || d === 6 ? [{ inicio: "09:00", fim: "17:00" }] : [],
    })),
  },
  {
    id: "247",
    rotulo: "24/7",
    dias: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      dia_semana: d,
      ativo: true,
      faixas: [{ inicio: "00:00", fim: "23:59" }],
    })),
  },
];

export function diasVaziosPadrao(): DiaDisponibilidadeOnboarding[] {
  return [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dia_semana: d, ativo: false, faixas: [] }));
}

export function diasDoPreset(presetId: string): DiaDisponibilidadeOnboarding[] {
  const p = PRESETS.find((x) => x.id === presetId);
  return p ? clonarDias(p.dias) : diasVaziosPadrao();
}

function clonarDias(dias: DiaDisponibilidadeOnboarding[]): DiaDisponibilidadeOnboarding[] {
  return dias.map((d) => ({ ...d, faixas: d.faixas.map((f) => ({ ...f })) }));
}

export function diasFromBlocos(
  blocos: DisponibilidadeProfissional[],
): DiaDisponibilidadeOnboarding[] {
  const base = diasVaziosPadrao();
  for (const b of blocos) {
    if (!b.is_active) continue;
    const dia = base[b.day_of_week];
    if (!dia) continue;
    dia.ativo = true;
    dia.faixas.push({
      inicio: b.start_time.slice(0, 5),
      fim: b.end_time.slice(0, 5),
    });
  }
  for (const d of base) {
    d.faixas.sort((a, b) => a.inicio.localeCompare(b.inicio));
  }
  return base;
}

export function diasParaBlocosPlanos(
  dias: DiaDisponibilidadeOnboarding[],
): Array<{ day_of_week: number; start_time: string; end_time: string }> {
  const out: Array<{ day_of_week: number; start_time: string; end_time: string }> = [];
  for (const d of dias) {
    if (!d.ativo) continue;
    for (const f of d.faixas) {
      if (!f.inicio || !f.fim || f.inicio >= f.fim) continue;
      out.push({
        day_of_week: d.dia_semana,
        start_time: `${f.inicio}:00`,
        end_time: `${f.fim}:00`,
      });
    }
  }
  return out;
}

interface Props {
  /** Modo "controlado": fornece dias e recebe alterações (usado no onboarding). */
  dias?: DiaDisponibilidadeOnboarding[];
  onChangeDias?: (dias: DiaDisponibilidadeOnboarding[]) => void;
  slotMin?: number;
  bufferMin?: number;
  onChangeSlotMin?: (v: number) => void;
  onChangeBufferMin?: (v: number) => void;

  /** Modo "painel": persiste direto na base. */
  driverId?: string;
  tenantId?: string;
  blocosIniciais?: DisponibilidadeProfissional[];
  onSalvo?: () => void;

  /** Esconde o botão salvar (quando controlado pelo onboarding). */
  ocultarSalvar?: boolean;
}

export function EditorDisponibilidadeSemanal({
  dias: diasProp,
  onChangeDias,
  slotMin: slotProp,
  bufferMin: bufferProp,
  onChangeSlotMin,
  onChangeBufferMin,
  driverId,
  tenantId,
  blocosIniciais,
  onSalvo,
  ocultarSalvar,
}: Props) {
  const controlado = !!onChangeDias;

  const [diasInternos, setDiasInternos] = useState<DiaDisponibilidadeOnboarding[]>(
    () => (blocosIniciais ? diasFromBlocos(blocosIniciais) : diasVaziosPadrao()),
  );
  const [slotInterno, setSlotInterno] = useState<number>(slotProp ?? 60);
  const [bufferInterno, setBufferInterno] = useState<number>(bufferProp ?? 0);
  const [salvando, setSalvando] = useState(false);

  // Atualiza ao receber blocos novos (modo painel)
  useEffect(() => {
    if (!controlado && blocosIniciais) {
      setDiasInternos(diasFromBlocos(blocosIniciais));
      const primeiro = blocosIniciais[0];
      if (primeiro) {
        setSlotInterno(primeiro.slot_duration_minutes ?? 60);
        setBufferInterno(primeiro.buffer_minutes ?? 0);
      }
    }
  }, [blocosIniciais, controlado]);

  const dias = diasProp ?? diasInternos;
  const slotMin = slotProp ?? slotInterno;
  const bufferMin = bufferProp ?? bufferInterno;

  const setDias = (novos: DiaDisponibilidadeOnboarding[]) => {
    if (onChangeDias) onChangeDias(novos);
    else setDiasInternos(novos);
  };
  const setSlot = (v: number) => {
    if (onChangeSlotMin) onChangeSlotMin(v);
    else setSlotInterno(v);
  };
  const setBuffer = (v: number) => {
    if (onChangeBufferMin) onChangeBufferMin(v);
    else setBufferInterno(v);
  };

  const aplicarPreset = (presetId: string) => {
    setDias(diasDoPreset(presetId));
    toast.success("Preset aplicado");
  };

  const toggleDia = (idx: number) => {
    const novos = clonarDias(dias);
    novos[idx].ativo = !novos[idx].ativo;
    if (novos[idx].ativo && novos[idx].faixas.length === 0) {
      novos[idx].faixas.push({ inicio: "09:00", fim: "18:00" });
    }
    setDias(novos);
  };

  const adicionarFaixa = (idx: number) => {
    const novos = clonarDias(dias);
    novos[idx].faixas.push({ inicio: "14:00", fim: "18:00" });
    novos[idx].ativo = true;
    setDias(novos);
  };

  const removerFaixa = (idx: number, faixaIdx: number) => {
    const novos = clonarDias(dias);
    novos[idx].faixas.splice(faixaIdx, 1);
    if (novos[idx].faixas.length === 0) novos[idx].ativo = false;
    setDias(novos);
  };

  const atualizarFaixa = (
    idx: number,
    faixaIdx: number,
    campo: "inicio" | "fim",
    valor: string,
  ) => {
    const novos = clonarDias(dias);
    novos[idx].faixas[faixaIdx][campo] = valor;
    setDias(novos);
  };

  const copiarSegundaParaSemana = () => {
    const seg = dias[1];
    if (!seg.ativo || seg.faixas.length === 0) {
      toast.error("Configure a segunda primeiro");
      return;
    }
    const novos = clonarDias(dias);
    for (let i = 2; i <= 5; i++) {
      novos[i] = {
        dia_semana: i,
        ativo: true,
        faixas: seg.faixas.map((f) => ({ ...f })),
      };
    }
    setDias(novos);
    toast.success("Segunda copiada para terça–sexta");
  };

  const salvar = async () => {
    if (!driverId || !tenantId) return;
    const blocos = diasParaBlocosPlanos(dias);
    if (blocos.length === 0) {
      toast.error("Configure pelo menos um dia com horário válido");
      return;
    }
    setSalvando(true);
    try {
      await salvarDisponibilidadeEmMassa({
        driver_id: driverId,
        tenant_id: tenantId,
        slot_duration_minutes: slotMin,
        buffer_minutes: bufferMin,
        blocos,
      });
      toast.success("Agenda salva");
      onSalvo?.();
    } catch (erro: any) {
      toast.error(erro?.message ?? "Erro ao salvar agenda");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Horários de atendimento</h3>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => aplicarPreset(p.id)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors"
          >
            {p.rotulo}
          </button>
        ))}
        <button
          type="button"
          onClick={copiarSegundaParaSemana}
          className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors inline-flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          Copiar seg → ter–sex
        </button>
      </div>

      {/* Slot e buffer globais */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3">
        <div className="space-y-1.5">
          <Label htmlFor="slot_global" className="text-xs">
            Duração de cada atendimento (min)
          </Label>
          <Input
            id="slot_global"
            type="number"
            min={5}
            step={5}
            value={slotMin}
            onChange={(e) => setSlot(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buffer_global" className="text-xs">
            Intervalo entre clientes (min)
          </Label>
          <Input
            id="buffer_global"
            type="number"
            min={0}
            step={5}
            value={bufferMin}
            onChange={(e) => setBuffer(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Grade semanal */}
      <div className="space-y-2">
        {dias.map((dia, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-3 transition-colors ${
              dia.ativo ? "border-primary/40 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Switch checked={dia.ativo} onCheckedChange={() => toggleDia(idx)} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{DIAS[idx]}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {dia.ativo ? `${dia.faixas.length} faixa${dia.faixas.length > 1 ? "s" : ""}` : "Folga"}
                  </p>
                </div>
              </div>
              {dia.ativo && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-xs"
                  onClick={() => adicionarFaixa(idx)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Faixa
                </Button>
              )}
            </div>

            {dia.ativo && dia.faixas.length > 0 && (
              <div className="mt-3 space-y-2">
                {dia.faixas.map((faixa, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={faixa.inicio}
                      onChange={(e) => atualizarFaixa(idx, fIdx, "inicio", e.target.value)}
                      className="h-9 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">até</span>
                    <Input
                      type="time"
                      value={faixa.fim}
                      onChange={(e) => atualizarFaixa(idx, fIdx, "fim", e.target.value)}
                      className="h-9 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removerFaixa(idx, fIdx)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remover faixa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!ocultarSalvar && driverId && tenantId && (
        <Button onClick={salvar} disabled={salvando} className="w-full h-11">
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar agenda"}
        </Button>
      )}

      {/* Resumo curto pra mobile */}
      <div className="text-[11px] text-muted-foreground">
        Aplica-se a todos os serviços. Você pode pausar a agenda ou bloquear datas específicas em Bloqueios.
      </div>
      {/* Compactos pra preview semanal */}
      <div className="hidden md:flex flex-wrap gap-1">
        {dias.map((d, i) => (
          <span
            key={i}
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              d.ativo ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {DIAS_CURTOS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
