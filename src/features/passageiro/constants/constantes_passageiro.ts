import type { OpcaoVeiculo, FormaPagamento } from "../types/tipos_passageiro";

export const FORMAS_PAGAMENTO: { id: FormaPagamento; label: string; icone: string }[] = [
  { id: "dinheiro", label: "Dinheiro", icone: "banknote" },
  { id: "pix", label: "PIX", icone: "qr-code" },
  { id: "cartao", label: "Cartão", icone: "credit-card" },
  { id: "saldo", label: "Saldo", icone: "wallet" },
];

export const ETAPAS_CORRIDA = [
  { id: "accepted", label: "Aceito" },
  { id: "a_caminho", label: "A caminho" },
  { id: "chegou", label: "Chegou" },
  { id: "in_progress", label: "Em viagem" },
] as const;


export const OPCOES_VEICULOS: OpcaoVeiculo[] = [
  {
    id: "executivo",
    nome: "Executivo",
    descricao: "Conforto e espaço",
    multiplicador: 1.4,
    icone: "car",
  },
  {
    id: "compacto",
    nome: "Compacto",
    descricao: "Econômico e prático",
    multiplicador: 1.0,
    icone: "car",
  },
  {
    id: "moto",
    nome: "Moto",
    descricao: "Rápido e acessível",
    multiplicador: 0.7,
    icone: "bike",
  },
];

export const TILE_URL_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export const COORDENADA_PADRAO = { lat: -8.0476, lng: -34.877 }; // Recife

export const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
