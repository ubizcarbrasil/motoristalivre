import type { AbaPainel } from "../types/tipos_painel";

export const ABAS_PAINEL: { id: AbaPainel; label: string; icone: string }[] = [
  { id: "inicio", label: "Início", icone: "home" },
  { id: "meus_links", label: "Meus Links", icone: "link2" },
  { id: "carteira", label: "Carteira", icone: "wallet" },
  { id: "perfil", label: "Perfil", icone: "user" },
  { id: "configuracoes", label: "Configurações", icone: "settings" },
];

export const TIMEOUT_DISPATCH_SEG = 28;

export const TIPOS_TRANSACAO_LABELS: Record<string, { label: string; entrada: boolean }> = {
  ride_earning: { label: "Corrida", entrada: true },
  commission_transbordo: { label: "Comissão transbordo", entrada: true },
  commission_affiliate: { label: "Comissão afiliado", entrada: true },
  commission_referral: { label: "Comissão indicação", entrada: true },
  pix_topup: { label: "Recarga PIX", entrada: true },
  withdrawal: { label: "Saque", entrada: false },
  subscription_fee: { label: "Mensalidade", entrada: false },
};

export const SELOS_MOTORISTA = [
  { id: "verificado", label: "Verificado", descricao: "Documentação aprovada" },
  { id: "top10", label: "Top 10", descricao: "Entre os 10 melhores do grupo" },
  { id: "veterano", label: "Veterano", descricao: "Mais de 6 meses de atuação" },
  { id: "5estrelas", label: "5 Estrelas", descricao: "Nota média acima de 4.8" },
];
