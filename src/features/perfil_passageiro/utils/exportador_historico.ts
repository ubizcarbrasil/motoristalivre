import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CorridaHistorico } from "../types/tipos_perfil_passageiro";
import { STATUS_CORRIDA_LABELS } from "../types/tipos_perfil_passageiro";
import type { ResumoCorridas } from "./utilitarios_perfil_passageiro";
import { BRANDING_PDF_PADRAO, type BrandingPdf } from "../types/tipos_branding_pdf";
import { clarearRgb, hexParaRgb } from "./utilitarios_cor_pdf";

interface DadosExportacao {
  corridas: CorridaHistorico[];
  resumo: ResumoCorridas;
  nomePassageiro: string;
  branding?: BrandingPdf;
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

async function carregarImagemBase64(url: string): Promise<string | null> {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return null;
    const blob = await resposta.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatoImagem(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")
    ? "JPEG"
    : "PNG";
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

export async function exportarHistoricoPdf({
  corridas,
  resumo,
  nomePassageiro,
  branding = BRANDING_PDF_PADRAO,
}: DadosExportacao): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();
  const margem = 14;

  const corPrimaria = hexParaRgb(branding.corPrimariaHex);
  const corPrimariaSuave = clarearRgb(corPrimaria, 0.88);

  // Cabeçalho colorido com branding (idêntico ao comprovante individual)
  const alturaHeader = 26;
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, larguraPagina, alturaHeader, "F");

  let xTextoHeader = margem;
  const logoDataUrl = branding.logoUrl ? await carregarImagemBase64(branding.logoUrl) : null;
  if (logoDataUrl) {
    const tamanhoLogo = 16;
    try {
      doc.addImage(
        logoDataUrl,
        formatoImagem(logoDataUrl),
        margem,
        (alturaHeader - tamanhoLogo) / 2,
        tamanhoLogo,
        tamanhoLogo
      );
      xTextoHeader = margem + tamanhoLogo + 5;
    } catch {
      // ignora se imagem falhar
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  if (branding.nomeEmpresa) {
    doc.text(branding.nomeEmpresa, xTextoHeader, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Histórico de corridas", xTextoHeader, 18);
  } else {
    doc.text("Histórico de corridas", xTextoHeader, 16);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR")}`,
    larguraPagina - margem,
    18,
    { align: "right" }
  );

  let cursorY = alturaHeader + 8;

  // Passageiro
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Passageiro: ${nomePassageiro}`, margem, cursorY);

  cursorY += 4;
  doc.setDrawColor(220);
  doc.line(margem, cursorY, larguraPagina - margem, cursorY);
  cursorY += 6;

  // Bloco de resumo destacado com cor do tenant
  const alturaResumo = 22;
  doc.setFillColor(...corPrimariaSuave);
  doc.setDrawColor(...corPrimaria);
  doc.roundedRect(margem, cursorY, larguraPagina - margem * 2, alturaResumo, 2, 2, "FD");

  const itensResumo: Array<[string, string]> = [
    ["Total", String(resumo.totalCorridas)],
    ["Concluídas", String(resumo.corridasConcluidas)],
    ["Total gasto", formatarValor(resumo.totalGasto)],
    ["Distância", formatarDistancia(resumo.totalDistancia)],
  ];

  const larguraColuna = (larguraPagina - margem * 2) / itensResumo.length;
  itensResumo.forEach(([label, valor], i) => {
    const xCentro = margem + larguraColuna * i + larguraColuna / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(label.toUpperCase(), xCentro, cursorY + 8, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...corPrimaria);
    doc.text(valor, xCentro, cursorY + 16, { align: "center" });
  });

  cursorY += alturaResumo + 6;

  // Tabela de corridas
  autoTable(doc, {
    startY: cursorY,
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
    headStyles: { fillColor: corPrimaria, textColor: 255, fontStyle: "bold" },
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
      const textoRodape = branding.nomeEmpresa
        ? `${branding.nomeEmpresa} · página ${pagina}`
        : `Página ${pagina}`;
      doc.text(
        textoRodape,
        larguraPagina - margem,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  doc.save(nomeArquivo("pdf"));
}
