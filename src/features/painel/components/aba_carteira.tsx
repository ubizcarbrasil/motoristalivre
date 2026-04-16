import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, Receipt, PiggyBank, TrendingUp } from "lucide-react";
import type { SaldoCarteira, TransacaoCarteira } from "../types/tipos_painel";
import { buscarSaldoCarteira, buscarTransacoes } from "../services/servico_painel";
import { TIPOS_TRANSACAO_LABELS } from "../constants/constantes_painel";
import { SheetSolicitarSaque } from "@/compartilhados/components/sheet_solicitar_saque";
import { HistoricoSaques } from "@/compartilhados/components/historico_saques";
import { garantirCarteira } from "@/compartilhados/services/servico_saque";

interface AbaCarteiraProps {
  userId: string;
}

function HeroSaldo({ saldo, onSacar }: { saldo: SaldoCarteira; onSacar: () => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5 space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Saldo disponível</p>
        <p className="text-3xl font-bold text-foreground mt-1">
          R${saldo.saldo.toFixed(2).replace(".", ",")}
        </p>
        {saldo.bloqueado > 0 && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            R${saldo.bloqueado.toFixed(2).replace(".", ",")} bloqueado
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 h-9 text-xs">
          <PiggyBank className="w-3.5 h-3.5 mr-1" />
          Recarregar
        </Button>
        <Button size="sm" variant="outline" className="flex-1 h-9 text-xs" onClick={onSacar}>
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          Sacar
        </Button>
        <Button size="sm" variant="outline" className="flex-1 h-9 text-xs">
          <Receipt className="w-3.5 h-3.5 mr-1" />
          Extrato
        </Button>
      </div>
    </div>
  );
}

function ItemTransacao({ transacao }: { transacao: TransacaoCarteira }) {
  const config = TIPOS_TRANSACAO_LABELS[transacao.tipo] ?? { label: transacao.tipo, entrada: true };
  const entrada = config.entrada;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        entrada ? "bg-primary/10" : "bg-destructive/10"
      }`}>
        {entrada ? (
          <ArrowDownLeft className="w-4 h-4 text-primary" />
        ) : (
          <ArrowUpRight className="w-4 h-4 text-destructive" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{config.label}</p>
        <p className="text-[10px] text-muted-foreground">
          {new Date(transacao.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span className={`text-sm font-semibold ${entrada ? "text-primary" : "text-destructive"}`}>
        {entrada ? "+" : "-"}R${Math.abs(transacao.valor).toFixed(2).replace(".", ",")}
      </span>
    </div>
  );
}

export function AbaCarteira({ userId }: AbaCarteiraProps) {
  const [saldo, setSaldo] = useState<SaldoCarteira>({ saldo: 0, bloqueado: 0, totalGanho: 0, totalSacado: 0 });
  const [transacoes, setTransacoes] = useState<TransacaoCarteira[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sheetSaqueAberto, setSheetSaqueAberto] = useState(false);
  const [versaoSaques, setVersaoSaques] = useState(0);

  const recarregar = useCallback(() => {
    return Promise.all([buscarSaldoCarteira(userId), buscarTransacoes(userId)])
      .then(([s, t]) => { setSaldo(s); setTransacoes(t); });
  }, [userId]);

  useEffect(() => {
    recarregar().finally(() => setCarregando(false));
  }, [recarregar]);

  const abrirSaque = async () => {
    await garantirCarteira("driver");
    await recarregar();
    setSheetSaqueAberto(true);
  };

  const aoSucessoSaque = async () => {
    await recarregar();
    setVersaoSaques((v) => v + 1);
  };

  return (
    <div className="pt-12 pb-20 px-5 space-y-5">
      <h2 className="text-lg font-semibold text-foreground">Carteira</h2>

      <HeroSaldo saldo={saldo} onSacar={abrirSaque} />

      <Tabs defaultValue="transacoes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="transacoes" className="text-xs">Transações</TabsTrigger>
          <TabsTrigger value="saques" className="text-xs">Histórico de saques</TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes" className="mt-4">
          {carregando ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Carregando...</p>
          ) : transacoes.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma transação</p>
          ) : (
            <div className="rounded-xl bg-card border border-border px-3">
              {transacoes.map((t) => (
                <ItemTransacao key={t.id} transacao={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saques" className="mt-4">
          <HistoricoSaques userId={userId} ownerType="driver" recarregar={versaoSaques} />
        </TabsContent>
      </Tabs>

      <SheetSolicitarSaque
        aberto={sheetSaqueAberto}
        onFechar={() => setSheetSaqueAberto(false)}
        ownerType="driver"
        saldoDisponivel={saldo.saldo}
        onSucesso={aoSucessoSaque}
      />
    </div>
  );
}
