export type TipoChavePix = "cpf" | "email" | "telefone" | "aleatoria";

export type DonoCarteira = "driver" | "affiliate";

export interface DadosSolicitacaoSaque {
  ownerType: DonoCarteira;
  amount: number;
  pixKey: string;
  pixKeyType: TipoChavePix;
}

export type StatusSaque = "pending" | "processing" | "completed" | "failed" | "approved" | "rejected";

export interface HistoricoSaque {
  id: string;
  amount: number;
  pix_key: string | null;
  pix_key_type: TipoChavePix | null;
  status: StatusSaque;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  processed_by_name: string | null;
}

export const VALOR_MINIMO_SAQUE = 10;

export const OPCOES_TIPO_CHAVE_PIX: { valor: TipoChavePix; label: string }[] = [
  { valor: "cpf", label: "CPF" },
  { valor: "email", label: "Email" },
  { valor: "telefone", label: "Telefone" },
  { valor: "aleatoria", label: "Aleatória" },
];

export const STATUS_SAQUE_LABELS: Record<StatusSaque, { label: string; cor: string }> = {
  pending: { label: "Pendente", cor: "text-yellow-500 bg-yellow-500/10" },
  processing: { label: "Processando", cor: "text-blue-500 bg-blue-500/10" },
  approved: { label: "Aprovado", cor: "text-primary bg-primary/10" },
  completed: { label: "Concluído", cor: "text-primary bg-primary/10" },
  rejected: { label: "Rejeitado", cor: "text-destructive bg-destructive/10" },
  failed: { label: "Falhou", cor: "text-destructive bg-destructive/10" },
};
