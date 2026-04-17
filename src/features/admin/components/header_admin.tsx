import { useNavigate } from "react-router-dom";
import { Car, LayoutDashboard, Download } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SecaoAdmin } from "../types/tipos_admin";
import { useTenantAdmin } from "../hooks/hook_tenant_admin";
import { useEhMotorista } from "@/features/passageiro/hooks/hook_eh_motorista";

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
  const navigate = useNavigate();
  const { tenantSlug } = useTenantAdmin();
  const { ehMotorista } = useEhMotorista();

  const irParaCorridas = () => {
    if (!tenantSlug) {
      toast.error("Grupo não encontrado");
      return;
    }
    navigate(`/${tenantSlug}`);
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <h1 className="flex-1 text-lg font-semibold text-foreground truncate">
        {TITULOS[secao]}
      </h1>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={irParaCorridas}
          className="h-9 gap-1.5"
          aria-label="Solicitar corrida"
        >
          <Car className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-medium">Corridas</span>
        </Button>

        {ehMotorista && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/painel")}
            className="h-9 gap-1.5"
            aria-label="Painel do motorista"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Painel</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/instalar")}
          className="h-9 gap-1.5"
          aria-label="Instalar app"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-medium">Instalar</span>
        </Button>
      </div>
    </header>
  );
}
