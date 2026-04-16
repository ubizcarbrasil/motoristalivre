import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  exportarHistoricoCsv,
  exportarHistoricoPdf,
} from "../utils/exportador_historico";
import type { CorridaHistorico } from "../types/tipos_perfil_passageiro";
import type { ResumoCorridas } from "../utils/utilitarios_perfil_passageiro";

interface MenuExportarHistoricoProps {
  corridas: CorridaHistorico[];
  resumo: ResumoCorridas;
  nomePassageiro: string;
}

export function MenuExportarHistorico({
  corridas,
  resumo,
  nomePassageiro,
}: MenuExportarHistoricoProps) {
  const desabilitado = corridas.length === 0;

  const exportar = (formato: "csv" | "pdf") => {
    try {
      const dados = { corridas, resumo, nomePassageiro };
      if (formato === "csv") exportarHistoricoCsv(dados);
      else exportarHistoricoPdf(dados);
      toast({
        title: "Exportação concluída",
        description: `Arquivo ${formato.toUpperCase()} gerado com ${corridas.length} corrida(s).`,
      });
    } catch (e) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={desabilitado}
          className="h-8 gap-1.5 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => exportar("pdf")} className="gap-2 text-xs">
          <FileText className="w-3.5 h-3.5 text-primary" />
          Comprovante PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportar("csv")} className="gap-2 text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
          Planilha CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
