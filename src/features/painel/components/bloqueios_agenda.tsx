import { useEffect, useState } from "react";
import { Plus, Trash2, Ban } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  listarBloqueiosAgenda,
  criarBloqueioAgenda,
  excluirBloqueioAgenda,
} from "@/features/servicos/services/servico_servicos";

interface Props {
  driverId: string;
  tenantId: string;
}

interface Bloqueio {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  all_day: boolean;
}

function formatarPeriodo(b: Bloqueio): string {
  const ini = new Date(b.starts_at);
  const fim = new Date(b.ends_at);
  const opt: Intl.DateTimeFormatOptions = b.all_day
    ? { day: "2-digit", month: "short" }
    : { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };
  return `${ini.toLocaleString("pt-BR", opt)} → ${fim.toLocaleString("pt-BR", opt)}`;
}

export function BloqueiosAgenda({ driverId, tenantId }: Props) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [salvando, setSalvando] = useState(false);

  const hoje = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    diaInicio: hoje,
    diaFim: hoje,
    horaInicio: "09:00",
    horaFim: "18:00",
    diaInteiro: true,
    motivo: "",
  });

  const recarregar = async () => {
    setCarregando(true);
    try {
      const data = await listarBloqueiosAgenda(driverId);
      setBloqueios(data as Bloqueio[]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    recarregar();
  }, [driverId]);

  const adicionar = async () => {
    const inicio = form.diaInteiro
      ? new Date(`${form.diaInicio}T00:00:00`)
      : new Date(`${form.diaInicio}T${form.horaInicio}:00`);
    const fim = form.diaInteiro
      ? new Date(`${form.diaFim}T23:59:59`)
      : new Date(`${form.diaFim}T${form.horaFim}:00`);

    if (fim <= inicio) {
      toast.error("Fim deve ser depois do início");
      return;
    }
    setSalvando(true);
    try {
      await criarBloqueioAgenda({
        driver_id: driverId,
        tenant_id: tenantId,
        starts_at: inicio.toISOString(),
        ends_at: fim.toISOString(),
        reason: form.motivo.trim() || null,
        all_day: form.diaInteiro,
      });
      toast.success("Bloqueio adicionado");
      setAberto(false);
      setForm({ ...form, motivo: "" });
      await recarregar();
    } catch (erro: any) {
      toast.error(erro?.message ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    if (!confirm("Remover este bloqueio?")) return;
    try {
      await excluirBloqueioAgenda(id);
      await recarregar();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Bloqueios da agenda</h3>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAberto(true)}>
          <Plus className="w-3.5 h-3.5" />
          Bloquear
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border p-3 space-y-2">
        {carregando && (
          <p className="text-[11px] text-muted-foreground italic">Carregando…</p>
        )}
        {!carregando && bloqueios.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic">
            Nenhum bloqueio futuro. Use isto para folgas, férias ou pausas pontuais.
          </p>
        )}
        {bloqueios.map((b) => (
          <div
            key={b.id}
            className="flex items-start justify-between gap-3 py-1.5 border-b border-border last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{formatarPeriodo(b)}</p>
              {b.reason && (
                <p className="text-[11px] text-muted-foreground truncate">{b.reason}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remover(b.id)}
              className="text-muted-foreground hover:text-destructive p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bloquear agenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <Label htmlFor="dia_inteiro" className="text-sm">Dia inteiro</Label>
              <Switch
                id="dia_inteiro"
                checked={form.diaInteiro}
                onCheckedChange={(v) => setForm({ ...form, diaInteiro: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Início</Label>
                <Input
                  type="date"
                  value={form.diaInicio}
                  onChange={(e) => setForm({ ...form, diaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fim</Label>
                <Input
                  type="date"
                  value={form.diaFim}
                  onChange={(e) => setForm({ ...form, diaFim: e.target.value })}
                />
              </div>
            </div>

            {!form.diaInteiro && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Hora início</Label>
                  <Input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Hora fim</Label>
                  <Input
                    type="time"
                    value={form.horaFim}
                    onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="motivo" className="text-xs">Motivo (opcional)</Label>
              <Input
                id="motivo"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Férias, compromisso pessoal…"
                maxLength={120}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionar} disabled={salvando}>
              {salvando ? "Salvando..." : "Bloquear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
