import type { LucideIcon } from "lucide-react";

export interface CardPerfilAcesso {
  id: "motorista" | "profissional" | "admin" | "passageiro";
  titulo: string;
  descricao: string;
  Icone: LucideIcon;
  acessoCaminho: string;
  cadastroCaminho?: string;
  observacao?: string;
}
