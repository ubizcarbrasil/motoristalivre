// Tipos da aba "Meus Links" — canais de geração de corrida do motorista
export type TipoCanalLink =
  | "motorista"
  | "afiliado"
  | "grupo"
  | "servicos"
  | "indicacao_servicos";

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
  cor: "roxo" | "azul" | "verde" | "dourado";
  stats: StatsCanalMes;
  rotuloMetricas?: {
    primario: string;
    secundario: string;
    terciario: string;
  };
}
