import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { exportarComprovanteCorrida } from "../utils/exportador_comprovante";
import type { DetalhesCorrida } from "../types/tipos_perfil_passageiro";

interface BotaoComprovanteCorridaProps {
  detalhes: DetalhesCorrida;
  nomePassageiro: string;
}

export function BotaoComprovanteCorrida({ detalhes, nomePassageiro }: BotaoComprovanteCorridaProps) {
  const [gerando, setGerando] = useState(false);

  const handleClick = async () => {
    setGerando(true);
    try {
      await exportarComprovanteCorrida(detalhes, nomePassageiro);
      toast({
        title: "Comprovante gerado",
        description: "Seu PDF foi baixado com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao gerar comprovante",
        description: "Não foi possível criar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={gerando}
      className="w-full h-11 gap-2 font-medium"
    >
      {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
      {gerando ? "Gerando comprovante..." : "Baixar comprovante PDF"}
    </Button>
  );
}
