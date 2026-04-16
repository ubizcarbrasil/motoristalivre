import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
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
import { buscarBrandingPdf } from "../services/servico_branding_pdf";
import { BRANDING_PDF_PADRAO } from "../types/tipos_branding_pdf";
import type { CorridaHistorico } from "../types/tipos_perfil_passageiro";
import type { ResumoCorridas } from "../utils/utilitarios_perfil_passageiro";

interface MenuExportarHistoricoProps {
  corridas: CorridaHistorico[];
  resumo: ResumoCorridas;
  nomePassageiro: string;
  tenantId: string | null;
}

export function MenuExportarHistorico({
  corridas,
  resumo,
  nomePassageiro,
  tenantId,
}: MenuExportarHistoricoProps) {
  const desabilitado = corridas.length === 0;
  const [gerando, setGerando] = useState(false);

  const exportar = async (formato: "csv" | "pdf") => {
    setGerando(true);
    try {
      if (formato === "csv") {
        exportarHistoricoCsv({ corridas, resumo, nomePassageiro });
      } else {
        const branding = tenantId ? await buscarBrandingPdf(tenantId) : BRANDING_PDF_PADRAO;
        await exportarHistoricoPdf({ corridas, resumo, nomePassageiro, branding });
      }
      toast({
        title: "Exportação concluída",
        description: `Arquivo ${formato.toUpperCase()} gerado com ${corridas.length} corrida(s).`,
      });
    } catch {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={desabilitado || gerando}
          className="h-8 gap-1.5 text-xs"
        >
          {gerando ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
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
