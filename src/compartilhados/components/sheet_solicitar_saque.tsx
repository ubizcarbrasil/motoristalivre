import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  OPCOES_TIPO_CHAVE_PIX,
  VALOR_MINIMO_SAQUE,
  type DonoCarteira,
  type TipoChavePix,
} from "../types/tipos_saque";
import { schemaSolicitarSaque } from "../schemas/schema_saque";
import { solicitarSaque } from "../services/servico_saque";

interface SheetSolicitarSaqueProps {
  aberto: boolean;
  onFechar: () => void;
  ownerType: DonoCarteira;
  saldoDisponivel: number;
  onSucesso: () => void;
}

export function SheetSolicitarSaque({
  aberto,
  onFechar,
  ownerType,
  saldoDisponivel,
  onSucesso,
}: SheetSolicitarSaqueProps) {
  const [valor, setValor] = useState("");
  const [chave, setChave] = useState("");
  const [tipoChave, setTipoChave] = useState<TipoChavePix>("cpf");
  const [enviando, setEnviando] = useState(false);

  const resetar = () => {
    setValor("");
    setChave("");
    setTipoChave("cpf");
  };

  const fechar = () => {
    if (enviando) return;
    resetar();
    onFechar();
  };

  const handleEnviar = async () => {
    const amount = Number(valor.replace(",", "."));
    const parse = schemaSolicitarSaque.safeParse({
      amount,
      pixKey: chave,
      pixKeyType: tipoChave,
      saldoDisponivel,
    });
    if (!parse.success) {
      toast.error(parse.error.errors[0]?.message ?? "Dados inválidos");
      return;
    }
    setEnviando(true);
    try {
      await solicitarSaque({
        ownerType,
        amount: parse.data.amount,
        pixKey: parse.data.pixKey,
        pixKeyType: parse.data.pixKeyType,
      });
      toast.success("Saque solicitado");
      resetar();
      onSucesso();
      onFechar();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao solicitar saque";
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={(o) => !o && fechar()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Solicitar saque</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Saldo disponível: R$ {saldoDisponivel.toFixed(2).replace(".", ",")}
          </p>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="valor-saque" className="text-xs">
              Valor (mínimo R$ {VALOR_MINIMO_SAQUE},00)
            </Label>
            <Input
              id="valor-saque"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={VALOR_MINIMO_SAQUE}
              max={saldoDisponivel}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              disabled={enviando}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tipo da chave PIX</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {OPCOES_TIPO_CHAVE_PIX.map((op) => (
                <button
                  key={op.valor}
                  type="button"
                  disabled={enviando}
                  onClick={() => setTipoChave(op.valor)}
                  className={cn(
                    "h-9 rounded-md text-xs font-medium border transition-colors",
                    tipoChave === op.valor
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:bg-secondary/80"
                  )}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chave-pix" className="text-xs">
              Chave PIX
            </Label>
            <Input
              id="chave-pix"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder="Sua chave PIX"
              maxLength={140}
              disabled={enviando}
            />
          </div>

          <Button
            onClick={handleEnviar}
            disabled={enviando}
            className="w-full h-11 mt-2"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Solicitar saque"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
