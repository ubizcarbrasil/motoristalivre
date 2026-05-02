import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schemaRegraComissao } from "../schemas/schema_regras_comissao";
import type {
  CategoriaServico,
  PayloadRegraComissao,
  RegraComissaoComCategoria,
} from "../types/tipos_regras_comissao";
import { SimuladorRepasse } from "./simulador_repasse";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  categorias: CategoriaServico[];
  regraExistente?: RegraComissaoComCategoria | null;
  categoriasJaConfiguradas: string[];
  salvando: boolean;
  onSalvar: (payload: PayloadRegraComissao) => Promise<void>;
}

export function DialogoEditorRegra({
  aberto,
  onFechar,
  categorias,
  regraExistente,
  categoriasJaConfiguradas,
  salvando,
  onSalvar,
}: Props) {
  const [categoryId, setCategoryId] = useState("");
  const [cobertura, setCobertura] = useState(10);
  const [indicacao, setIndicacao] = useState(5);
  const [fixa, setFixa] = useState(0);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (!aberto) return;
    if (regraExistente) {
      setCategoryId(regraExistente.category_id);
      setCobertura(Number(regraExistente.comissao_cobertura_pct));
      setIndicacao(Number(regraExistente.comissao_indicacao_pct));
      setFixa(Number(regraExistente.comissao_fixa_brl));
      setAtivo(regraExistente.ativo);
    } else {
      setCategoryId("");
      setCobertura(10);
      setIndicacao(5);
      setFixa(0);
      setAtivo(true);
    }
  }, [aberto, regraExistente]);

  const categoriasDisponiveis = categorias.filter(
    (c) =>
      !categoriasJaConfiguradas.includes(c.id) ||
      c.id === regraExistente?.category_id,
  );

  async function handleSubmit() {
    const validacao = schemaRegraComissao.safeParse({
      category_id: categoryId,
      comissao_cobertura_pct: cobertura,
      comissao_indicacao_pct: indicacao,
      comissao_fixa_brl: fixa,
      ativo,
    });
    if (!validacao.success) {
      toast.error(validacao.error.issues[0]?.message ?? "Valores inválidos");
      return;
    }
    await onSalvar({
      category_id: categoryId,
      comissao_cobertura_pct: cobertura,
      comissao_indicacao_pct: indicacao,
      comissao_fixa_brl: fixa,
      ativo,
    });
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {regraExistente ? "Editar regra" : "Nova regra de comissão"}
          </DialogTitle>
          <DialogDescription>
            Define percentual de cobertura, indicação e/ou valor fixo por categoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Categoria</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={!!regraExistente}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasDisponiveis.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
                {categoriasDisponiveis.length === 0 && (
                  <SelectItem value="_none" disabled>
                    Todas as categorias já têm regra
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cobertura (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={cobertura}
                onChange={(e) => setCobertura(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Indicação (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={indicacao}
                onChange={(e) => setIndicacao(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Valor fixo de cobertura (R$){" "}
              <span className="text-muted-foreground">— opcional, sobrepõe %</span>
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={fixa}
              onChange={(e) => setFixa(Number(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-xs">Regra ativa</Label>
              <p className="text-[11px] text-muted-foreground">
                Quando inativa, motor usa o fallback global do tenant.
              </p>
            </div>
            <Switch checked={ativo} onCheckedChange={setAtivo} />
          </div>

          <SimuladorRepasse
            comissao_cobertura_pct={cobertura}
            comissao_indicacao_pct={indicacao}
            comissao_fixa_brl={fixa}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={salvando || !categoryId}>
            {salvando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {regraExistente ? "Salvar" : "Criar regra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
