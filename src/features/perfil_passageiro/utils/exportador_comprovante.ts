import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DetalhesCorrida } from "../types/tipos_perfil_passageiro";
import { STATUS_CORRIDA_LABELS } from "../types/tipos_perfil_passageiro";

const PAGAMENTO_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  saldo: "Saldo",
};

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

function nomeArquivo(rideId: string): string {
  const data = new Date().toISOString().slice(0, 10);
  const curto = rideId.slice(0, 8);
  return `comprovante-${data}-${curto}.pdf`;
}

/**
 * Gera URL de mapa estático com origem (verde) e destino (vermelho)
 * usando o serviço público staticmap.openstreetmap.de.
 */
function urlMapaEstatico(detalhes: DetalhesCorrida, largura: number, altura: number): string | null {
  const { origin_lat, origin_lng, dest_lat, dest_lng } = detalhes;
  if (origin_lat === null || origin_lng === null || dest_lat === null || dest_lng === null) {
    return null;
  }
  const centroLat = (origin_lat + dest_lat) / 2;
  const centroLng = (origin_lng + dest_lng) / 2;
  const marcadores = [
    `markers=${origin_lat},${origin_lng},lightgreen1`,
    `markers=${dest_lat},${dest_lng},red1`,
  ].join("&");
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${centroLat},${centroLng}&zoom=13&size=${largura}x${altura}&maptype=mapnik&${marcadores}`;
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

export async function exportarComprovanteCorrida(
  detalhes: DetalhesCorrida,
  nomePassageiro: string
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();
  const margem = 14;
  let cursorY = 18;

  // Cabeçalho
  doc.setFillColor(29, 184, 101);
  doc.rect(0, 0, larguraPagina, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30);
  doc.text("Comprovante de corrida", margem, cursorY);

  cursorY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Passageiro: ${nomePassageiro}`, margem, cursorY);
  doc.text(
    `Emitido em ${new Date().toLocaleString("pt-BR")}`,
    larguraPagina - margem,
    cursorY,
    { align: "right" }
  );

  cursorY += 4;
  doc.setDrawColor(220);
  doc.line(margem, cursorY, larguraPagina - margem, cursorY);
  cursorY += 6;

  // Status + ID
  const status = STATUS_CORRIDA_LABELS[detalhes.status];
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`ID: ${detalhes.id}`, margem, cursorY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 184, 101);
  doc.text(status.label.toUpperCase(), larguraPagina - margem, cursorY, { align: "right" });
  cursorY += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Solicitada em ${formatarDataHora(detalhes.created_at)}`, margem, cursorY);
  cursorY += 8;

  // Mapa estático
  const larguraMapaPx = 600;
  const alturaMapaPx = 300;
  const urlMapa = urlMapaEstatico(detalhes, larguraMapaPx, alturaMapaPx);
  if (urlMapa) {
    const dataUrl = await carregarImagemBase64(urlMapa);
    if (dataUrl) {
      const larguraMapa = larguraPagina - margem * 2;
      const alturaMapa = (larguraMapa * alturaMapaPx) / larguraMapaPx;
      try {
        doc.addImage(dataUrl, "PNG", margem, cursorY, larguraMapa, alturaMapa);
        cursorY += alturaMapa + 6;
      } catch {
        // ignora se imagem falhar
      }
    }
  }

  // Endereços
  autoTable(doc, {
    startY: cursorY,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold", textColor: [120, 120, 120] },
      1: { cellWidth: "auto" },
    },
    body: [
      ["ORIGEM", detalhes.origin_address ?? "-"],
      ["DESTINO", detalhes.dest_address ?? "-"],
    ],
  });
  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // Métricas (distância, duração, pagamento, conclusão)
  const metricas: Array<[string, string]> = [];
  if (detalhes.distance_km !== null) {
    metricas.push(["Distância", formatarDistancia(detalhes.distance_km)]);
  }
  const minutos = detalhes.duration_min ?? detalhes.estimated_min;
  if (minutos !== null) {
    metricas.push([detalhes.duration_min ? "Duração" : "Estimativa", `${minutos} min`]);
  }
  if (detalhes.payment_method) {
    metricas.push([
      "Pagamento",
      PAGAMENTO_LABELS[detalhes.payment_method] ?? detalhes.payment_method,
    ]);
  }
  if (detalhes.completed_at) {
    metricas.push(["Concluída em", formatarDataHora(detalhes.completed_at)]);
  }

  if (metricas.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      head: [["Detalhes da viagem", ""]],
      body: metricas,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [29, 184, 101], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: [80, 80, 80] },
        1: { cellWidth: "auto" },
      },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // Motorista e veículo
  if (detalhes.motorista.id) {
    const linhasMotorista: Array<[string, string]> = [
      ["Motorista", detalhes.motorista.nome],
    ];
    if (detalhes.motorista.veiculo_modelo) {
      linhasMotorista.push(["Veículo", detalhes.motorista.veiculo_modelo]);
    }
    if (detalhes.motorista.veiculo_cor) {
      linhasMotorista.push(["Cor", detalhes.motorista.veiculo_cor]);
    }
    if (detalhes.motorista.veiculo_placa) {
      linhasMotorista.push(["Placa", detalhes.motorista.veiculo_placa]);
    }
    autoTable(doc, {
      startY: cursorY,
      head: [["Motorista e veículo", ""]],
      body: linhasMotorista,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [29, 184, 101], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: [80, 80, 80] },
        1: { cellWidth: "auto" },
      },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // Valor pago — bloco destacado
  if (detalhes.price_paid !== null) {
    const alturaCaixa = 16;
    doc.setFillColor(232, 250, 240);
    doc.setDrawColor(29, 184, 101);
    doc.roundedRect(margem, cursorY, larguraPagina - margem * 2, alturaCaixa, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("VALOR PAGO", margem + 4, cursorY + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(29, 184, 101);
    doc.text(formatarValor(detalhes.price_paid), larguraPagina - margem - 4, cursorY + 11, {
      align: "right",
    });
    cursorY += alturaCaixa + 6;
  }

  // Rodapé
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Este é um comprovante gerado automaticamente.",
    larguraPagina / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  doc.save(nomeArquivo(detalhes.id));
}
