interface DadosIcs {
  titulo: string;
  descricao?: string;
  inicio: Date;
  duracaoMinutos: number;
  local?: string;
}

function formatarData(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function gerarIcs({ titulo, descricao, inicio, duracaoMinutos, local }: DadosIcs): string {
  const fim = new Date(inicio.getTime() + duracaoMinutos * 60_000);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@tribocar`;
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TriboCar//PT-BR",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatarData(new Date())}`,
    `DTSTART:${formatarData(inicio)}`,
    `DTEND:${formatarData(fim)}`,
    `SUMMARY:${titulo}`,
    descricao ? `DESCRIPTION:${descricao.replace(/\n/g, "\\n")}` : "",
    local ? `LOCATION:${local}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return linhas.join("\r\n");
}

export function baixarIcs(dados: DadosIcs, nomeArquivo = "agendamento.ics") {
  const conteudo = gerarIcs(dados);
  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
