import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MODOS_COBRANCA } from "../constants/constantes_onboarding";
import type { DadosServico, ModoCobranca } from "../types/tipos_onboarding";

interface CardServicoOnboardingProps {
  servico: DadosServico;
  onChange: (servico: DadosServico) => void;
  onRemover: () => void;
}

export function CardServicoOnboarding({
  servico,
  onChange,
  onRemover,
}: CardServicoOnboardingProps) {
  const modo = MODOS_COBRANCA.find((m) => m.valor === servico.modoCobranca)!;

  const atualizar = <K extends keyof DadosServico>(campo: K, valor: DadosServico[K]) => {
    onChange({ ...servico, [campo]: valor });
  };

  const trocarModo = (novo: ModoCobranca) => {
    let duracaoPadrao = servico.duracao;
    if (novo === "fixed") duracaoPadrao = 60;
    if (novo === "hourly") duracaoPadrao = 1;
    if (novo === "daily") duracaoPadrao = 1;
    onChange({ ...servico, modoCobranca: novo, duracao: duracaoPadrao });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor={`nome-${servico.id}`}>Nome do serviço</Label>
          <Input
            id={`nome-${servico.id}`}
            value={servico.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex: Detalhamento completo, Diária de motorista..."
            maxLength={80}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemover}
          className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`desc-${servico.id}`}>Descrição (opcional)</Label>
        <Textarea
          id={`desc-${servico.id}`}
          value={servico.descricao}
          onChange={(e) => atualizar("descricao", e.target.value)}
          placeholder="O que está incluso, diferenciais..."
          maxLength={300}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Modo de cobrança</Label>
        <div className="grid grid-cols-3 gap-2">
          {MODOS_COBRANCA.map((m) => (
            <button
              key={m.valor}
              type="button"
              onClick={() => trocarModo(m.valor)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                servico.modoCobranca === m.valor
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"
              }`}
            >
              {m.titulo}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`preco-${servico.id}`}>{modo.rotuloPreco}</Label>
          <Input
            id={`preco-${servico.id}`}
            type="number"
            min={0}
            step={0.01}
            value={servico.preco}
            onChange={(e) => atualizar("preco", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`dur-${servico.id}`}>{modo.rotuloDuracao}</Label>
          <Input
            id={`dur-${servico.id}`}
            type="number"
            min={0}
            step={servico.modoCobranca === "fixed" ? 5 : 1}
            value={servico.duracao}
            onChange={(e) => atualizar("duracao", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/60 bg-background/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Cobrar sinal/depósito</Label>
            <p className="text-[11px] text-muted-foreground">
              Garante o agendamento com pagamento antecipado.
            </p>
          </div>
          <Switch
            checked={servico.depositoAtivo}
            onCheckedChange={(v) => atualizar("depositoAtivo", v)}
          />
        </div>

        {servico.depositoAtivo && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => atualizar("depositoTipo", "percent")}
                className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  servico.depositoTipo === "percent"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                Percentual
              </button>
              <button
                type="button"
                onClick={() => atualizar("depositoTipo", "value")}
                className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  servico.depositoTipo === "value"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                Valor fixo
              </button>
            </div>
            {servico.depositoTipo === "percent" ? (
              <Input
                type="number"
                min={0}
                max={100}
                value={servico.depositoPct}
                onChange={(e) => atualizar("depositoPct", Number(e.target.value))}
                placeholder="% do valor"
              />
            ) : (
              <Input
                type="number"
                min={0}
                step={0.01}
                value={servico.depositoValor}
                onChange={(e) => atualizar("depositoValor", Number(e.target.value))}
                placeholder="R$"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
