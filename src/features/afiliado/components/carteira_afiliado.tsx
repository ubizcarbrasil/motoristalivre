import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowUpRight } from "lucide-react";
import { SheetSolicitarSaque } from "@/compartilhados/components/sheet_solicitar_saque";
import { HistoricoSaques } from "@/compartilhados/components/historico_saques";
import { garantirCarteira } from "@/compartilhados/services/servico_saque";

interface CarteiraAfiliadoProps {
  userId: string;
  saldo: number;
  onSaqueSolicitado?: () => void;
}

export function CarteiraAfiliado({ userId, saldo, onSaqueSolicitado }: CarteiraAfiliadoProps) {
  const [aberto, setAberto] = useState(false);
  const [versaoSaques, setVersaoSaques] = useState(0);

  const abrir = async () => {
    await garantirCarteira("affiliate");
    setAberto(true);
  };

  const aoSucesso = () => {
    setVersaoSaques((v) => v + 1);
    onSaqueSolicitado?.();
  };

  return (
    <div className="px-5 space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Carteira</span>
          </div>
          <p className="mb-4 text-2xl font-bold text-primary">R$ {saldo.toFixed(2)}</p>
          <Button size="sm" variant="outline" className="w-full" onClick={abrir}>
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            Sacar
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="saques" className="w-full">
        <TabsList className="grid w-full grid-cols-1 h-9">
          <TabsTrigger value="saques" className="text-xs">Histórico de saques</TabsTrigger>
        </TabsList>
        <TabsContent value="saques" className="mt-3">
          <HistoricoSaques userId={userId} ownerType="affiliate" recarregar={versaoSaques} />
        </TabsContent>
      </Tabs>

      <SheetSolicitarSaque
        aberto={aberto}
        onFechar={() => setAberto(false)}
        ownerType="affiliate"
        saldoDisponivel={saldo}
        onSucesso={aoSucesso}
      />
    </div>
  );
}
