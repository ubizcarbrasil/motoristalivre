import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CorridaHistorico } from "../types/tipos_perfil_passageiro";
import { STATUS_CORRIDA_LABELS } from "../types/tipos_perfil_passageiro";
import type { ResumoCorridas } from "./utilitarios_perfil_passageiro";

interface DadosExportacao {
  corridas: CorridaHistorico[];
  resumo: ResumoCorridas;
  nomePassageiro: string;
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarValor(v: number | null): string {
  if (v === null) return "-";
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function formatarDistancia(km: number | null): string {
  if (km === null) return "-";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

function nomeArquivo(extensao: string): string {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10);
  return `historico-corridas-${data}.${extensao}`;
}

function disparaDownload(blob: Blob, nome: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escaparCampoCsv(valor: string): string {
  if (/[",;\n\r]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export function exportarHistoricoCsv({ corridas }: DadosExportacao): void {
  const cabecalho = [
    "Data",
    "Status",
    "Motorista",
    "Origem",
    "Destino",
    "Distância (km)",
    "Valor (R$)",
  ];

  const linhas = corridas.map((c) => [
    formatarDataHora(c.created_at),
    STATUS_CORRIDA_LABELS[c.status].label,
    c.motorista_nome,
    c.origin_address ?? "",
    c.dest_address ?? "",
    c.distance_km !== null ? c.distance_km.toFixed(2).replace(".", ",") : "",
    c.price_paid !== null ? c.price_paid.toFixed(2).replace(".", ",") : "",
  ]);

  const conteudo = [cabecalho, ...linhas]
    .map((linha) => linha.map((c) => escaparCampoCsv(String(c))).join(";"))
    .join("\r\n");

  // BOM para Excel reconhecer UTF-8
  const blob = new Blob([`\uFEFF${conteudo}`], { type: "text/csv;charset=utf-8;" });
  disparaDownload(blob, nomeArquivo("csv"));
}

export function exportarHistoricoPdf({ corridas, resumo, nomePassageiro }: DadosExportacao): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Histórico de corridas", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Passageiro: ${nomePassageiro}`, 14, 25);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    larguraPagina - 14,
    25,
    { align: "right" }
  );

  doc.setDrawColor(220);
  doc.line(14, 29, larguraPagina - 14, 29);

  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Resumo", 14, 37);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const resumoLinhas = [
    `Total de corridas: ${resumo.totalCorridas}`,
    `Concluídas: ${resumo.corridasConcluidas}`,
    `Total gasto: ${formatarValor(resumo.totalGasto)}`,
    `Distância total: ${formatarDistancia(resumo.totalDistancia)}`,
  ];
  resumoLinhas.forEach((l, i) => doc.text(l, 14, 44 + i * 5));

  autoTable(doc, {
    startY: 70,
    head: [["Data", "Status", "Motorista", "Origem → Destino", "Dist.", "Valor"]],
    body: corridas.map((c) => [
      formatarDataHora(c.created_at),
      STATUS_CORRIDA_LABELS[c.status].label,
      c.motorista_nome,
      `${c.origin_address ?? "-"}\n→ ${c.dest_address ?? "-"}`,
      formatarDistancia(c.distance_km),
      formatarValor(c.price_paid),
    ]),
    styles: { fontSize: 8, cellPadding: 2, valign: "middle" },
    headStyles: { fillColor: [29, 184, 101], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 20 },
      2: { cellWidth: 28 },
      3: { cellWidth: "auto" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
    },
    didDrawPage: () => {
      const pagina = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${pagina}`,
        larguraPagina - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  doc.save(nomeArquivo("pdf"));
}
