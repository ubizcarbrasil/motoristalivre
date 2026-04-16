// Tipos da aba "Meus Links" — canais de geração de corrida do motorista
export type TipoCanalLink = "motorista" | "afiliado" | "grupo";

export interface StatsCanalMes {
  corridas: number;
  ganhos: number;
  conversao: number; // 0–100
}

export interface CanalLink {
  tipo: TipoCanalLink;
  titulo: string;
  descricao: string;
  url: string;
  handle: string;
  cor: "roxo" | "azul" | "verde";
  stats: StatsCanalMes;
}
