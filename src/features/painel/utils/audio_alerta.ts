// Helpers para gerar beeps via Web Audio API sem precisar de arquivos externos.
// Funciona em iOS Safari após primeira interação do usuário.

export type TipoSomChamada = "suave" | "padrao" | "sirene";

let contextoAudio: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (contextoAudio && contextoAudio.state !== "closed") return contextoAudio;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    contextoAudio = new Ctx();
    return contextoAudio;
  } catch {
    return null;
  }
}

export async function destravarAudio(): Promise<boolean> {
  const ctx = obterContexto();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  return ctx.state === "running";
}

interface OpcoesBeep {
  frequencia?: number;
  duracaoMs?: number;
  volume?: number;
  tipo?: OscillatorType;
  delayMs?: number;
}

export function tocarBeep(opcoes: OpcoesBeep = {}) {
  const ctx = obterContexto();
  if (!ctx || ctx.state !== "running") return;

  const { frequencia = 880, duracaoMs = 180, volume = 0.18, tipo = "sine", delayMs = 0 } = opcoes;
  const inicio = ctx.currentTime + delayMs / 1000;
  const fim = inicio + duracaoMs / 1000;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frequencia, inicio);

  // envelope suave para evitar clique
  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(volume, inicio + 0.01);
  gain.gain.linearRampToValueAtTime(volume, fim - 0.04);
  gain.gain.linearRampToValueAtTime(0, fim);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(inicio);
  osc.stop(fim + 0.02);
}

/**
 * Sirene policial: alterna 2 frequências em sweep contínuo.
 */
function tocarSirene(intenso: boolean) {
  const ctx = obterContexto();
  if (!ctx || ctx.state !== "running") return;

  const inicio = ctx.currentTime;
  const duracaoTotal = intenso ? 0.9 : 0.7;
  const volume = intenso ? 0.22 : 0.16;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";

  // Sweep entre 600Hz e 1100Hz (estilo sirene)
  osc.frequency.setValueAtTime(600, inicio);
  osc.frequency.linearRampToValueAtTime(1100, inicio + duracaoTotal / 2);
  osc.frequency.linearRampToValueAtTime(600, inicio + duracaoTotal);

  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(volume, inicio + 0.02);
  gain.gain.linearRampToValueAtTime(volume, inicio + duracaoTotal - 0.05);
  gain.gain.linearRampToValueAtTime(0, inicio + duracaoTotal);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracaoTotal + 0.02);
}

/**
 * Toca o padrão de alerta de acordo com o tipo escolhido.
 */
export function tocarPadraoAlerta(intenso = false, tipo: TipoSomChamada = "padrao") {
  if (tipo === "suave") {
    // Uma única nota grave e curta, baixo volume
    tocarBeep({
      frequencia: 660,
      duracaoMs: 200,
      volume: intenso ? 0.16 : 0.11,
      tipo: "sine",
    });
    return;
  }

  if (tipo === "sirene") {
    tocarSirene(intenso);
    return;
  }

  // padrao: "ding-ding" (duas notas curtas em terça maior)
  tocarBeep({ frequencia: 880, duracaoMs: 160, volume: intenso ? 0.25 : 0.18 });
  tocarBeep({ frequencia: 1175, duracaoMs: 200, volume: intenso ? 0.28 : 0.2, delayMs: 200 });
}

export function vibrarPadrao(intenso = false) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(intenso ? [500, 150, 500, 150, 500] : [400, 200, 400]);
  } catch {
    // ignore
  }
}

/**
 * Pré-visualização do som (toca uma vez) — usado no seletor de configurações.
 */
export async function previewSomChamada(tipo: TipoSomChamada) {
  await destravarAudio();
  tocarPadraoAlerta(false, tipo);
}
