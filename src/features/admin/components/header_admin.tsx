import { SidebarTrigger } from "@/components/ui/sidebar";
import type { SecaoAdmin } from "../types/tipos_admin";

const TITULOS: Record<SecaoAdmin, string> = {
  dashboard: "Dashboard",
  motoristas: "Motoristas",
  afiliados: "Afiliados",
  crm: "CRM — Clientes",
  corridas: "Corridas",
  carteira: "Carteira do Grupo",
  identidade: "Identidade Visual",
  regras: "Regras e Despacho",
  comissoes: "Comissoes",
};

interface HeaderAdminProps {
  secao: SecaoAdmin;
}

export function HeaderAdmin({ secao }: HeaderAdminProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <h1 className="text-lg font-semibold text-foreground">{TITULOS[secao]}</h1>
    </header>
  );
}
