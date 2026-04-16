import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarAdmin } from "../components/sidebar_admin";
import { HeaderAdmin } from "../components/header_admin";
import { SecaoDashboard } from "../components/secao_dashboard";
import { SecaoMotoristas } from "../components/secao_motoristas";
import { SecaoAfiliados } from "../components/secao_afiliados";
import { SecaoCRM } from "../components/secao_crm";
import { SecaoCorridas } from "../components/secao_corridas";
import { SecaoCarteira } from "../components/secao_carteira";
import { SecaoIdentidade } from "../components/secao_identidade";
import { SecaoRegras } from "../components/secao_regras";
import { SecaoComissoes } from "../components/secao_comissoes";
import { useAdmin } from "../hooks/hook_admin";

const SECOES = {
  dashboard: SecaoDashboard,
  motoristas: SecaoMotoristas,
  afiliados: SecaoAfiliados,
  crm: SecaoCRM,
  corridas: SecaoCorridas,
  carteira: SecaoCarteira,
  identidade: SecaoIdentidade,
  regras: SecaoRegras,
  comissoes: SecaoComissoes,
} as const;

export default function PaginaAdmin() {
  const { secaoAtiva, setSecaoAtiva } = useAdmin();
  const Conteudo = SECOES[secaoAtiva];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarAdmin secaoAtiva={secaoAtiva} onNavegar={setSecaoAtiva} />
        <div className="flex flex-1 flex-col">
          <HeaderAdmin secao={secaoAtiva} />
          <main className="flex-1 overflow-auto">
            <Conteudo />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
