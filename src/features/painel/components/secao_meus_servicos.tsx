import { useState } from "react";
import { Plus, Trash2, Briefcase, MapPin } from "lucide-react";
import { EditorEnderecoServico } from "@/features/servicos/components/editor_endereco_servico";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  criarServico,
  atualizarServico,
  excluirServico,
} from "@/features/servicos/services/servico_servicos";
import type { TipoServico } from "@/features/servicos/types/tipos_servicos";

interface SecaoMeusServicosProps {
  driverId: string;
  tenantId: string;
  servicos: TipoServico[];
  onAtualizar: () => void;
}

export function SecaoMeusServicos({ driverId, tenantId, servicos, onAtualizar }: SecaoMeusServicosProps) {
  const [aberto, setAberto] = useState(false);
  const [servicoEnderecoEdicao, setServicoEnderecoEdicao] = useState<TipoServico | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    is_immediate: false,
  });

  const resetar = () => {
    setForm({ name: "", description: "", duration_minutes: 60, price: 0, is_immediate: false });
  };

  const salvar = async () => {
    if (!form.name.trim() || form.price <= 0 || form.duration_minutes <= 0) {
      toast.error("Preencha nome, duração e preço");
      return;
    }
    setSalvando(true);
    try {
      await criarServico({
        driver_id: driverId,
        tenant_id: tenantId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        duration_minutes: form.duration_minutes,
        price: form.price,
        is_immediate: form.is_immediate,
      });
      toast.success("Serviço adicionado");
      setAberto(false);
      resetar();
      onAtualizar();
    } catch (erro: any) {
      toast.error(erro?.message ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (s: TipoServico) => {
    try {
      await atualizarServico(s.id, { is_active: !s.is_active });
      onAtualizar();
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const remover = async (s: TipoServico) => {
    if (!confirm(`Excluir "${s.name}"?`)) return;
    try {
      await excluirServico(s.id);
      toast.success("Serviço removido");
      onAtualizar();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const ativos = servicos.filter((s) => s.is_active).length;
  const pausados = servicos.length - ativos;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Meus serviços ativos</h3>
            {servicos.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {ativos} ativo{ativos === 1 ? "" : "s"}
                {pausados > 0 ? ` · ${pausados} pausado${pausados === 1 ? "" : "s"}` : ""}
              </p>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAberto(true)}>
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </Button>
      </div>

      {servicos.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-4 text-center space-y-1">
          <p className="text-xs text-foreground font-medium">
            Nenhum serviço com preço cadastrado
          </p>
          <p className="text-[11px] text-muted-foreground">
            Para que clientes possam agendar e pagar, cadastre serviços com nome, duração e valor.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {servicos.map((s) => (
            <div key={s.id} className="rounded-xl bg-card border border-border p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {s.duration_minutes} min · R$ {Number(s.price).toFixed(2)}
                </p>
              </div>
              <Switch checked={s.is_active} onCheckedChange={() => alternarAtivo(s)} />
              <button
                type="button"
                onClick={() => remover(s)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={(o) => { setAberto(o); if (!o) resetar(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="serv_nome">Nome</Label>
              <Input
                id="serv_nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Consulta inicial"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serv_desc">Descrição</Label>
              <Textarea
                id="serv_desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes opcionais"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="serv_dur">Duração (min)</Label>
                <Input
                  id="serv_dur"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serv_preco">Preço (R$)</Label>
                <Input
                  id="serv_preco"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="serv_imediato" className="cursor-pointer">
                Atendimento imediato
              </Label>
              <Switch
                id="serv_imediato"
                checked={form.is_immediate}
                onCheckedChange={(v) => setForm({ ...form, is_immediate: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
