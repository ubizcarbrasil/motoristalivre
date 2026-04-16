import { SidebarTrigger } from "@/components/ui/sidebar";
import type { SecaoRoot } from "../types/tipos_root";

const TITULOS: Record<SecaoRoot, string> = {
  visao_geral: "Visao Geral",
  tenants: "Tenants",
  planos: "Planos",
  afiliados: "Afiliados",
  financeiro: "Financeiro",
  auditoria: "Auditoria",
};

export function HeaderRoot({ secao }: { secao: SecaoRoot }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <h1 className="text-lg font-semibold text-foreground">{TITULOS[secao]}</h1>
    </header>
  );
}
