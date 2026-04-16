import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, List } from "lucide-react";
import { SheetSolicitarSaque } from "@/compartilhados/components/sheet_solicitar_saque";
import { garantirCarteira } from "@/compartilhados/services/servico_saque";

interface CarteiraAfiliadoProps {
  saldo: number;
  onSaqueSolicitado?: () => void;
}

export function CarteiraAfiliado({ saldo, onSaqueSolicitado }: CarteiraAfiliadoProps) {
  const [aberto, setAberto] = useState(false);

  const abrir = async () => {
    await garantirCarteira("affiliate");
    setAberto(true);
  };

  return (
    <div className="px-5">
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Carteira</span>
          </div>
          <p className="mb-4 text-2xl font-bold text-primary">R$ {saldo.toFixed(2)}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={abrir}>
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              Sacar
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <List className="mr-1 h-3.5 w-3.5" />
              Extrato
            </Button>
          </div>
        </CardContent>
      </Card>

      <SheetSolicitarSaque
        aberto={aberto}
        onFechar={() => setAberto(false)}
        ownerType="affiliate"
        saldoDisponivel={saldo}
        onSucesso={() => onSaqueSolicitado?.()}
      />
    </div>
  );
}
