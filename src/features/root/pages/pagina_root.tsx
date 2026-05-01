import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarRoot } from "../components/sidebar_root";
import { HeaderRoot } from "../components/header_root";
import { SecaoVisaoGeral } from "../components/secao_visao_geral";
import { SecaoTenants } from "../components/secao_tenants";
import { SecaoPlanos } from "../components/secao_planos";
import { SecaoAfiliadosRoot } from "../components/secao_afiliados_root";
import { SecaoFinanceiro } from "../components/secao_financeiro";
import { SecaoOperacao } from "../components/secao_operacao";
import { SecaoAuditoria } from "../components/secao_auditoria";
import { useRoot } from "../hooks/hook_root";

const SECOES = {
  visao_geral: SecaoVisaoGeral,
  tenants: SecaoTenants,
  planos: SecaoPlanos,
  afiliados: SecaoAfiliadosRoot,
  financeiro: SecaoFinanceiro,
  operacao: SecaoOperacao,
  auditoria: SecaoAuditoria,
} as const;

export default function PaginaRoot() {
  const { secaoAtiva, setSecaoAtiva } = useRoot();
  const Conteudo = SECOES[secaoAtiva];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarRoot secaoAtiva={secaoAtiva} onNavegar={setSecaoAtiva} />
        <div className="flex flex-1 flex-col">
          <HeaderRoot secao={secaoAtiva} />
          <main className="flex-1 overflow-auto">
            <Conteudo />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
