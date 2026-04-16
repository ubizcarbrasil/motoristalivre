export interface CorridaValidacao {
  id: string;
  data_iso: string;
  valor: number | null;
  pagamento: string;
  motorista_nome: string | null;
  veiculo_modelo: string | null;
  veiculo_cor: string | null;
  veiculo_placa: string | null;
  origem: string | null;
  destino: string | null;
  distancia_km: number | null;
}

export interface BrandingValidacao {
  nome_empresa: string | null;
  logo_url: string | null;
  cor_primaria: string;
}

export interface RespostaValidacao {
  encontrada: boolean;
  corrida?: CorridaValidacao;
  branding?: BrandingValidacao;
}
