export type TipoChavePix = "cpf" | "email" | "telefone" | "aleatoria";

export type DonoCarteira = "driver" | "affiliate";

export interface DadosSolicitacaoSaque {
  ownerType: DonoCarteira;
  amount: number;
  pixKey: string;
  pixKeyType: TipoChavePix;
}

export const VALOR_MINIMO_SAQUE = 10;

export const OPCOES_TIPO_CHAVE_PIX: { valor: TipoChavePix; label: string }[] = [
  { valor: "cpf", label: "CPF" },
  { valor: "email", label: "Email" },
  { valor: "telefone", label: "Telefone" },
  { valor: "aleatoria", label: "Aleatória" },
];
