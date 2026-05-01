import type { SecaoRoot } from "../types/tipos_root";
import { LayoutDashboard, Building2, CreditCard, Users, DollarSign, Activity, Shield, type LucideIcon } from "lucide-react";

export interface ItemMenuRoot {
  id: SecaoRoot;
  label: string;
  icone: LucideIcon;
}

export const MENU_ROOT: ItemMenuRoot[] = [
  { id: "visao_geral", label: "Visão Geral", icone: LayoutDashboard },
  { id: "tenants", label: "Tribos", icone: Building2 },
  { id: "planos", label: "Planos", icone: CreditCard },
  { id: "afiliados", label: "Afiliados", icone: Users },
  { id: "financeiro", label: "Financeiro", icone: DollarSign },
  { id: "operacao", label: "Operação", icone: Activity },
  { id: "auditoria", label: "Auditoria", icone: Shield },
];
