import { useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  criarBlocoDisponibilidade,
  excluirBlocoDisponibilidade,
} from "@/features/servicos/services/servico_servicos";
import type { DisponibilidadeProfissional } from "@/features/servicos/types/tipos_servicos";

interface Props {
  driverId: string;
  tenantId: string;
  blocos: DisponibilidadeProfissional[];
  onAtualizar: () => void;
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function SecaoMinhaDisponibilidade({ driverId, tenantId, blocos, onAtualizar }: Props) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "18:00",
    slot_duration_minutes: 60,
    buffer_minutes: 0,
  });

  const adicionar = async () => {
    if (form.start_time >= form.end_time) {
      toast.error("Horário final deve ser maior que o inicial");
      return;
    }
    setSalvando(true);
    try {
      await criarBlocoDisponibilidade({
        driver_id: driverId,
        tenant_id: tenantId,
        ...form,
      });
      toast.success("Bloco adicionado");
      setAberto(false);
      onAtualizar();
    } catch (erro: any) {
      toast.error(erro?.message ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    if (!confirm("Excluir este bloco?")) return;
    try {
      await excluirBlocoDisponibilidade(id);
      onAtualizar();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const blocosPorDia = DIAS.map((_, dia) => blocos.filter((b) => b.day_of_week === dia));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Minha disponibilidade</h3>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAberto(true)}>
          <Plus className="w-3.5 h-3.5" />
          Bloco
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border p-3 space-y-2">
        {DIAS.map((dia, idx) => (
          <div key={dia} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
            <span className="text-xs font-medium text-muted-foreground w-10 pt-1">{dia}</span>
            <div className="flex-1 flex flex-wrap gap-1.5">
              {blocosPorDia[idx].length === 0 && (
                <span className="text-[11px] text-muted-foreground italic">—</span>
              )}
              {blocosPorDia[idx].map((b) => (
                <div
                  key={b.id}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary/60 px-2 py-1 text-[11px]"
                >
                  <span className="font-mono text-foreground">
                    {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                  </span>
                  <span className="text-muted-foreground">({b.slot_duration_minutes}m)</span>
                  <button
                    type="button"
                    onClick={() => remover(b.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo bloco de disponibilidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <div className="grid grid-cols-7 gap-1">
                {DIAS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, day_of_week: i })}
                    className={`h-9 rounded-md text-xs font-medium transition-colors ${
                      form.day_of_week === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bl_inicio">Início</Label>
                <Input
                  id="bl_inicio"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bl_fim">Fim</Label>
                <Input
                  id="bl_fim"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bl_slot">Duração do slot (min)</Label>
                <Input
                  id="bl_slot"
                  type="number"
                  min={5}
                  step={5}
                  value={form.slot_duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, slot_duration_minutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bl_buffer">Buffer (min)</Label>
                <Input
                  id="bl_buffer"
                  type="number"
                  min={0}
                  step={5}
                  value={form.buffer_minutes}
                  onChange={(e) => setForm({ ...form, buffer_minutes: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionar} disabled={salvando}>
              {salvando ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
