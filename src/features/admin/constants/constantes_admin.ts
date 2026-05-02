import type { SecaoAdmin } from "../types/tipos_admin";
import {
  LayoutDashboard,
  Car,
  Users,
  UserCheck,
  Route,
  Wallet,
  Palette,
  Settings,
  Percent,
  type LucideIcon,
} from "lucide-react";

export interface ItemMenu {
  id: SecaoAdmin;
  label: string;
  /** Label alternativa para tribos em modo Serviços */
  labelServicos?: string;
  icone: LucideIcon;
  /** Ícone alternativo para tribos em modo Serviços */
  iconeServicos?: LucideIcon;
}

export interface GrupoMenu {
  titulo: string;
  itens: ItemMenu[];
}

export const MENU_ADMIN: GrupoMenu[] = [
  {
    titulo: "Operacao",
    itens: [
      { id: "dashboard", label: "Dashboard", icone: LayoutDashboard },
      {
        id: "motoristas",
        label: "Motoristas",
        labelServicos: "Profissionais",
        icone: Car,
      },
      { id: "afiliados", label: "Afiliados", icone: Users },
      { id: "crm", label: "CRM", icone: UserCheck },
      {
        id: "corridas",
        label: "Corridas",
        labelServicos: "Agendamentos",
        icone: Route,
      },
      { id: "carteira", label: "Carteira do Grupo", icone: Wallet },
    ],
  },
  {
    titulo: "Configuracoes",
    itens: [
      { id: "identidade", label: "Identidade Visual", icone: Palette },
      { id: "regras", label: "Regras e Despacho", icone: Settings },
      { id: "comissoes", label: "Comissoes", icone: Percent },
    ],
  },
];
